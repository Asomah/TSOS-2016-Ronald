///<reference path="../globals.ts" />
///<reference path="../os/pcb.ts" />

module TSOS {

    export class CpuScheduler {
        constructor() {

        }

        //roll out a program from memory to hard drive
        public static rollout(program) {
            var programInput: string = "";

            for (var i = program.base; i <= program.limit; i++) {
                programInput += _MemoryArray[i];
            }


            _DeviceDriverFileSystem.createFile("process" + program.PID);
            _DeviceDriverFileSystem.writeToFile("process" + program.PID, programInput);
            _CurrentProgram.location = "Hard Disk";

            _MemoryManager.resetPartition(program);

            //log roll out process
            _Kernel.krnTrace( program.PID + " Rolled out ");

        }

        //load a program from hard drive and load it to memory
        public static rollin(program) {

            var programInput = _DeviceDriverFileSystem.readFile("process" + program.PID);

            var j = program.base;
            for (var i = 0; i < programInput.length; i++) {
                _MemoryArray[j] = programInput[i] + programInput[i + 1];
                j++;
                i++;
            }
            //_MemoryManager.loadProgToMem();
            _MemoryManager.updateMemTable(program);

            _DeviceDriverFileSystem.deleteFile("process" + program.PID);

            //log roll in process
            _Kernel.krnTrace( program.PID + " Rolled in ");

        }

        //Swap out process and place it on 
        public static swapProgram(currProg, nextProg) {
            if (nextProg.base == -1) {
                nextProg.startIndex = currProg.base;
                //alert("New prog start index =" + nextProg.startIndex);
            } else {
                //Get the start index for the next program in a particular segment
                nextProg.startIndex = (nextProg.startIndex - nextProg.base) + currProg.base;
            }

            nextProg.base = currProg.base;
            nextProg.limit = currProg.limit;

            if (currProg.state != PS_Terminated) {
                this.rollout(currProg);

            }
            this.rollin(nextProg);

            //log roll out process
            _Kernel.krnTrace( "Swapping " + currProg.PID + " out of memory and " + nextProg.PID + " into memory");

        }

        public static priority() {
            var nextProgram = this.priorityNextProgram();

            if (nextProgram.location == "Hard Disk") {
                if (_CurrentProgram.state == PS_Terminated) {
                    if (nextProgram.base == -1) {
                        nextProgram.startIndex = _CurrentProgram.base;
                        //alert("New prog start index =" + nextProg.startIndex);
                    } else {
                        //Get the start index for the next program in a particular segment
                        nextProgram.startIndex = (nextProgram.startIndex - nextProgram.base) + _CurrentProgram.base;
                    }
                    nextProgram.base = _CurrentProgram.base;
                    nextProgram.limit = _CurrentProgram.limit;

                    this.rollin(nextProgram);
                    nextProgram.location = "Memory";
                }
                else {
                    this.swapProgram(_CurrentProgram, nextProgram);
                    _CurrentProgram.location = "Hard Disk";
                    nextProgram.location = "Memory";
                    _MemoryManager.updatePcbTable(_CurrentProgram);
                }
            }

            _CurrentProgram = nextProgram;
            //update pcb table for the new rolled-in program
            _MemoryManager.updatePcbTable(_CurrentProgram);

            //Load next program
            _CPU.startIndex = _CurrentProgram.startIndex;
            _CPU.PC = _CurrentProgram.PC;
            _CPU.Acc = _CurrentProgram.Acc;
            _CPU.Xreg = _CurrentProgram.Xreg;
            _CPU.Yreg = _CurrentProgram.Yreg;
            _CPU.Zflag = _CurrentProgram.Zflag;

            if (_ReadyQueue.length == 1) {
                _RunAll = false;

            }


        }
        public static priorityNextProgram() {

            var lowestPriority = _ReadyQueue[0].priority;
            var nextProgram = _ReadyQueue[0];
            for (var i = 1; i < _ReadyQueue.length; i++) {
                if (_ReadyQueue[i].priority < lowestPriority) {
                    lowestPriority = _ReadyQueue[i].priority;
                    nextProgram = _ReadyQueue[i];

                }
            }

            //alert(_CurrentProgram.PID + " priority" + _CurrentProgram.priority);
            return nextProgram;

        }


        public static roundRobin() {
            var nextProgram = new Pcb();

            if (_CurrentProgram.state != PS_Terminated) {
                if (_ClockTicks < _Quantum) {
                    _ClockTicks++;
                    //increase wait time
                    _WaitTime++;
                }
                else {

                    //set current's program's time 
                    nextProgram = this.getNextprogram();

                    nextProgram.waitTime = _CurrentProgram.waitTime + _WaitTime;
                    _MemoryManager.updatePcbTable(nextProgram);

                    this.contextSwitch();

                    //reset clock ticks 
                    _ClockTicks = 1;

                    //reset wait time
                    _WaitTime = 1;

                }
            }
            else {
                //set current's program's time
                nextProgram = this.getNextprogram();
                nextProgram.waitTime = _CurrentProgram.waitTime + _WaitTime;
                _MemoryManager.updatePcbTable(nextProgram);
                this.contextSwitch();

                //reset wait time
                _WaitTime = 1;
            }

        }

        //Context switch 
        public static contextSwitch() {
            //break and save current state of program
            var nextProgram = new Pcb();
            nextProgram = this.getNextprogram();
            //alert("1 CPU " + _CPU.PC);



            if (_CurrentProgram.state == PS_Terminated) {
                if (_ReadyQueue.length == 1) {
                    _RunAll = false;
                    _DONE = true;

                }
                else if (_ReadyQueue.length > 1) {

                    _CurrentProgram.state = PS_Terminated;
                    _MemoryManager.updatePcbTable(_CurrentProgram);

                    for (var i = 0; i < _ReadyQueue.length; i++) {
                        if (_ReadyQueue[i].PID == _CurrentProgram.PID) {
                            _ReadyQueue.splice(i, 1);

                            //Restore memory after program finishes running and update memory table
                            //alert("1 Resetting partition " + _CurrentProgram.PID + " and base " + _CurrentProgram.base + " value =" + _MemoryArray[_CurrentProgram.startIndex]);
                            _MemoryManager.resetPartition(_CurrentProgram);
                            _MemoryManager.updateMemTable(_CurrentProgram);

                            _MemoryManager.deleteRowPcb(_CurrentProgram);
                            break;
                        }

                    }

                    if (nextProgram.location == "Hard Disk") {
                        //alert("next Program in HD =" + nextProgram.PID);
                        //roll next prongram to memory after deleting terminated program

                        if (nextProgram.base == -1) {
                            nextProgram.startIndex = _CurrentProgram.base;
                            //alert("New prog start index =" + nextProg.startIndex);
                        } else {
                            //Get the start index for the next program in a particular segment
                            nextProgram.startIndex = (nextProgram.startIndex - nextProgram.base) + _CurrentProgram.base;
                        }

                        //get base and limit for next program
                        nextProgram.base = _CurrentProgram.base;
                        nextProgram.limit = _CurrentProgram.limit;

                        this.rollin(nextProgram);
                        nextProgram.location = "Memory";
                    }
                    nextProgram.state = PS_Ready;
                    _MemoryManager.updatePcbTable(nextProgram);

                    //execute format command if it is activated
                    if (_FormatCommandActive == true) {
                        _DeviceDriverFileSystem.format();
                    }

                }
            }
            else {
                //alert("1 base " + _CurrentProgram.base + " Limit " + _CurrentProgram.limit);

                //swap files if next program is on hard disk
                if (nextProgram.location == "Hard Disk") {
                    this.swapProgram(_CurrentProgram, nextProgram);
                    _CurrentProgram.location = "Hard Disk";
                    nextProgram.location = "Memory";
                    _MemoryManager.updatePcbTable(_CurrentProgram);
                }
                //Break and save all cpu values to current program
                _Kernel.krnInterruptHandler(BREAK_IRQ, "");

            }

            //alert("1. startIndex = " + nextProgram.startIndex);
            //Load next program
            _CurrentProgram = nextProgram;
            _CPU.startIndex = _CurrentProgram.startIndex;
            _CPU.PC = _CurrentProgram.PC;
            _CPU.Acc = _CurrentProgram.Acc;
            _CPU.Xreg = _CurrentProgram.Xreg;
            _CPU.Yreg = _CurrentProgram.Yreg;
            _CPU.Zflag = _CurrentProgram.Zflag;



        }
        public static getNextprogram() {

            /**
             * Get next program in memory
             */

            var nextProgram = new Pcb();

            if (_ReadyQueue.length == 1) {
                if (_MemoryManager.fetch(_CPU.startIndex) != "00") {
                    nextProgram = _CurrentProgram;
                    _RunAll = false;
                    _DONE = true;
                    //_CPU.cycle();
                }

            }
            else {
                for (var i = 0; i < _ReadyQueue.length; i++) {
                    //Get next program in queue
                    if (_CurrentProgram.PID == _ReadyQueue[i].PID) {
                        //set next program to the program in the begining of the queue if the 
                        //last program in queue is curreent
                        if (i == _ReadyQueue.length - 1) {
                            nextProgram = _ReadyQueue[0];
                            _WaitTime = 0;
                        }
                        else {
                            nextProgram = _ReadyQueue[i + 1];
                        }
                        break;

                    }
                }
            }

            return nextProgram;

        }



    }

}
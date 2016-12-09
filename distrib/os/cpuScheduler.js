///<reference path="../globals.ts" />
///<reference path="../os/pcb.ts" />
var TSOS;
(function (TSOS) {
    var CpuScheduler = (function () {
        function CpuScheduler() {
        }
        //roll out a program from memory to hard drive
        CpuScheduler.rollout = function (program) {
            program = _CurrentProgram;
            var programInput = "";
            for (var i = program.base; i <= program.limit; i++) {
                programInput += _MemoryArray[i];
            }
            _DeviceDriverFileSystem.createFile("process" + program.PID);
            _DeviceDriverFileSystem.writeToFile("process" + program.PID, programInput);
            _CurrentProgram.location = "Hard Disk";
            _MemoryManager.resetPartition(program);
        };
        //load a program from hard drive and load it to memory
        CpuScheduler.rollin = function (program) {
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
        };
        //Swap out process and place it on 
        CpuScheduler.swapProgram = function (currProg, nextProg) {
            nextProg.base = currProg.base;
            nextProg.limit = currProg.limit;
            _IsProgramName = true;
            //if (currProg.state != PS_Terminated){
            this.rollout(currProg);
            //}
            this.rollin(nextProg);
            _IsProgramName = false;
        };
        CpuScheduler.priority = function () {
            _CurrentProgram = this.priorityNextProgram();
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
        };
        CpuScheduler.priorityNextProgram = function () {
            var lowestPriority = _ReadyQueue[0].priority;
            _CurrentProgram = _ReadyQueue[0];
            for (var i = 1; i < _ReadyQueue.length; i++) {
                if (_ReadyQueue[i].priority < lowestPriority) {
                    lowestPriority = _ReadyQueue[i].priority;
                    _CurrentProgram = _ReadyQueue[i];
                }
            }
            //alert(_CurrentProgram.PID + " priority" + _CurrentProgram.priority);
            return _CurrentProgram;
        };
        CpuScheduler.roundRobin = function () {
            var nextProgram = new TSOS.Pcb();
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
                    //alert("PID " + nextProgram.PID + " wait time =" + nextProgram.waitTime);
                    _MemoryManager.updatePcbTable(nextProgram);
                    // alert("2Clock Ticks " + _ClockTicks);
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
                //alert("PID " + nextProgram.PID + " wait time =" + nextProgram.waitTime);
                _MemoryManager.updatePcbTable(nextProgram);
                this.contextSwitch();
                //reset wait time
                _WaitTime = 1;
            }
        };
        //Context switch 
        CpuScheduler.contextSwitch = function () {
            //break and save current state of program
            var nextProgram = new TSOS.Pcb();
            nextProgram = this.getNextprogram();
            //alert("1 CPU " + _CPU.PC);
            //alert("1 base " + _CurrentProgram.base + " Limit " + _CurrentProgram.limit);
            if (nextProgram.location == "Hard Disk") {
                this.swapProgram(_CurrentProgram, nextProgram);
                _CurrentProgram.location = "Hard Disk";
                nextProgram.location = "Memory";
                _MemoryManager.updatePcbTable(_CurrentProgram);
            }
            //alert("2 CPU " + _CPU.PC);
            //alert("2 base " + nextProgram.base + " Limit " + nextProgram.limit);
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
                            _MemoryManager.resetPartition(_CurrentProgram);
                            _MemoryManager.updateMemTable(_CurrentProgram);
                            _MemoryManager.deleteRowPcb(_CurrentProgram);
                            break;
                        }
                    }
                    nextProgram.state = PS_Ready;
                    _MemoryManager.updatePcbTable(nextProgram);
                }
            }
            else {
                //Break and save all cpu values to current program
                _Kernel.krnInterruptHandler(BREAK_IRQ, "");
            }
            //Load next program
            _CurrentProgram = nextProgram;
            _CPU.startIndex = _CurrentProgram.startIndex;
            _CPU.PC = _CurrentProgram.PC;
            _CPU.Acc = _CurrentProgram.Acc;
            _CPU.Xreg = _CurrentProgram.Xreg;
            _CPU.Yreg = _CurrentProgram.Yreg;
            _CPU.Zflag = _CurrentProgram.Zflag;
        };
        CpuScheduler.getNextprogram = function () {
            /**
             * Get next program in memory
             */
            var nextProgram = new TSOS.Pcb();
            if (_ReadyQueue.length == 1) {
                if (_MemoryManager.fetch(_CPU.startIndex) != "00") {
                    nextProgram = _CurrentProgram;
                    _RunAll = false;
                    _DONE = true;
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
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));

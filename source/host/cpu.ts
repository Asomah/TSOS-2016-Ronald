///<reference path="../globals.ts" />
///<reference path="../os/cpuScheduler.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(
            public startIndex = 0,
            public PC: number = 0,
            public IR: string = _IR,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public Zflag: number = 0,
            public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.IR = "NA";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        //Decode Instructions


        public executeProgram(opCode) {

            if (opCode == "A9") {
                _IR = opCode;

                //Load the accumulator with constant
                //Get Next byte from memory
                this.PC++;
                var memAddress = _MemoryManager.fetch(++this.startIndex);
                //convert constant from hex to base 10 and set it to accumulator
                this.Acc = parseInt(memAddress, 16);
                _Acc = this.Acc;

            }
            else if (opCode == "AD") {
                _IR = opCode;
                // Load the acccumulator from memeory
                // Load the the next two bytes and switch them
                this.PC += 2;
                var memAddress = _MemoryManager.fetch(++this.startIndex);
                memAddress = _MemoryManager.fetch(++this.startIndex) + memAddress;
                var address = parseInt(memAddress, 16);
                if (_CurrentProgram.base == 256) {
                    address = address + 256;
                }
                else if (_CurrentProgram.base == 512) {
                    address = address + 512;
                }
                var getAcc = _MemoryManager.fetch(address);
                this.Acc = parseInt(getAcc, 16);
                _Acc = parseInt(getAcc, 16);

            }
            else if (opCode == "8D") {

                _IR = opCode;
                //Store accumulator in memory
                // Load the the next two bytes 
                this.PC += 2;
                var memAddress = _MemoryManager.fetch(++this.startIndex);
                memAddress = _MemoryManager.fetch(++this.startIndex) + memAddress;
                var destAddress = parseInt(memAddress, 16);
                if (_CurrentProgram.base == 256) {
                    destAddress = destAddress + 256;
                }
                else if (_CurrentProgram.base == 512) {
                    destAddress = destAddress + 512;
                }
                _MemoryManager.storeValue(this.Acc.toString(16), destAddress);
            }
            else if (opCode == "6D") {

                _IR = opCode;
                //Add with carry
                // Load the the next two bytes 
                this.PC += 2;
                var memAddress = _MemoryManager.fetch(++this.startIndex);
                memAddress = _MemoryManager.fetch(++this.startIndex) + memAddress;
                var address = parseInt(memAddress, 16);
                if (_CurrentProgram.base == 256) {
                    address = address + 256;
                }
                else if (_CurrentProgram.base == 512) {
                    address = address + 512;
                }
                var value = _MemoryManager.fetch(address);
                this.Acc = this.Acc + parseInt(value, 16);
                _Acc = this.Acc + parseInt(value, 16);

            }
            else if (opCode == "A2") {
                _IR = opCode;
                //Load the X resgister with a constant
                // Load the the next byte 
                this.PC++;
                var numValue = _MemoryManager.fetch(++this.startIndex);
                this.Xreg = parseInt(numValue, 16);
                _Xreg = parseInt(numValue, 16);

            }
            else if (opCode == "AE") {
                _IR = opCode;
                //Load the X register from memory
                // Load the the next two bytes
                this.PC += 2;
                var memAddress = _MemoryManager.fetch(++this.startIndex);
                memAddress = _MemoryManager.fetch(++this.startIndex) + memAddress;
                var address = parseInt(memAddress, 16);
                if (_CurrentProgram.base == 256) {
                    address = address + 256;
                }
                else if (_CurrentProgram.base == 512) {
                    address = address + 512;
                }
                var value = _MemoryManager.fetch(address);
                this.Xreg = parseInt(value, 16);
                _Xreg = parseInt(value, 16);

            }
            else if (opCode == "A0") {
                _IR = opCode;
                //Load Y register with a constant 
                // Load the the next byte 
                this.PC++;
                var numValue = _MemoryManager.fetch(++this.startIndex);
                this.Yreg = parseInt(numValue, 16);
                _Yreg = parseInt(numValue, 16);
            }
            else if (opCode == "AC") {
                _IR = opCode;
                //Load Y register from memory 
                // Load the the next two bytes
                this.PC += 2;
                var memAddress = _MemoryManager.fetch(++this.startIndex);
                memAddress = _MemoryManager.fetch(++this.startIndex) + memAddress;
                var address = parseInt(memAddress, 16);
                if (_CurrentProgram.base == 256) {
                    address = address + 256;
                }
                else if (_CurrentProgram.base == 512) {
                    address = address + 512;
                }
                var value = _MemoryManager.fetch(address);
                this.Yreg = parseInt(value, 16);
                _Yreg = parseInt(value, 16);

            }
            else if (opCode == "EA") {
                _IR = opCode;
                //Do Nothing

            }
            else if (opCode == "00") {
                _IR = opCode;
                //Break
                _CurrentProgram.startIndex = this.startIndex;
                _CurrentProgram.PC = this.PC;
                _CurrentProgram.Acc = this.Acc;
                _CurrentProgram.Xreg = this.Xreg;
                _CurrentProgram.Yreg = this.Yreg;
                _CurrentProgram.Zflag = this.Zflag;


            }
            else if (opCode == "EC") {
                _IR = opCode;
                //Compare a byte in memory to the X register
                //Set the Z flag if equal
                // Load the the next two bytes 
                this.PC += 2;
                var memAddress = _MemoryManager.fetch(++this.startIndex);
                memAddress = _MemoryManager.fetch(++this.startIndex) + memAddress;
                var address = parseInt(memAddress, 16);
                if (_CurrentProgram.base == 256) {
                    address = address + 256;
                }
                else if (_CurrentProgram.base == 512) {
                    address = address + 512;
                }
                var value = _MemoryManager.fetch(address);
                var newV = _MemoryManager.fetch(parseInt(memAddress, 16));
                var xValue = parseInt(value, 16);

                if (xValue == this.Xreg) {
                    this.Zflag = 1;
                    _Zflag = 1;
                }
                else {
                    this.Zflag = 0;
                    _Zflag = 0;
                }

            }
            else if (opCode == "D0") {
                _IR = opCode;
                //Branch n bytes if Z flag is zero
                if (this.Zflag == 0) {
                    this.PC++;

                    var jump = parseInt(_MemoryManager.fetch(++this.startIndex), 16);
                    var index = this.startIndex;
                    // Fetch the next byte and Branch
                    var nextAddress = this.startIndex + jump;
                    var pc = this.startIndex + jump;
                    if (nextAddress >= (_CurrentProgram.limit + 1)) {
                        nextAddress = nextAddress - _ProgramSize;

                    }
                    this.startIndex = nextAddress;

                    if (_CurrentProgram.base == 0) {
                        this.PC = nextAddress;
                    }
                    else if (_CurrentProgram.base == 256) {
                        this.PC = nextAddress - 256;
                    }
                    else {
                        this.PC = nextAddress - 512;
                    }
                } else {
                    this.startIndex++;
                    this.PC++;
                }

            }
            else if (opCode == "EE") {
                _IR = opCode;
                //Increament the value of a byte and store to memory
                this.PC += 2;
                var memAddress = _MemoryManager.fetch(++this.startIndex);
                memAddress = _MemoryManager.fetch(++this.startIndex) + memAddress;
                var address = parseInt(memAddress, 16);
                if (_CurrentProgram.base == 256) {
                    address = address + 256;
                }
                else if (_CurrentProgram.base == 512) {
                    address = address + 512;
                }
                var value = _MemoryArray[address];
                var newValue = parseInt(value, 16) + 1;
                if (address <= _CurrentProgram.limit) {
                    value = newValue.toString(16);
                }

                _MemoryManager.storeValue(value, address);


            }
            else if (opCode == "FF") {
                _IR = opCode;
                _Kernel.krnInterruptHandler(SYSCALL_IRQ, this.Xreg);
            }
            else {
                //kill current program if there is an invalid opcode
                _StdOut.putText("INVALID OPCODE .... KILLING PROGRAM " + _CurrentProgram.PID);
                _Kernel.krnInterruptHandler(INVALIDOPCODE_IRQ, _CurrentProgram.PID);
                _StdOut.advanceLine();
                _StdOut.putText(">");

            }

            this.PC++;
            this.startIndex++;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            //debugger;
            if (_MemoryManager.fetch(this.startIndex) != "00" && _DONE != true) {
                this.executeProgram(_MemoryManager.fetch(this.startIndex));
                _CurrentProgram.state = PS_Running;

                //Increase turn around time for all programs in ready queue 
                for (var i = 0; i < _ReadyQueue.length; i++) {
                    _ReadyQueue[i].taTime++;
                }

                //Update memory, pcb table and cpu log tables
                _MemoryManager.updateMemTable(_CurrentProgram);
                _MemoryManager.updatePcbTable(_CurrentProgram);
                _MemoryManager.updateCpuTable();

                //Perform round robbin or fcfs if ready queue is greater than 0
                if (_ReadyQueue.length > 1 && _CpuSchedule != "priority") {
                    CpuScheduler.roundRobin();
                }

            }
            else {

                this.isExecuting = false;
                //set the next program to execute
                //Get current program if ready queue length is 1
                if (_ReadyQueue.length == 1) {
                    _CurrentProgram = _ReadyQueue[0];
                }
                _CurrentProgram.state = PS_Terminated;
                _MemoryManager.updatePcbTable(_CurrentProgram);

                if ((_RunAll == true && _DONE != true) || _ReadyQueue.length > 1) {
                    //reset partition for terminated program
                    //_MemoryManager.resetPartition(_CurrentProgram);
                    if (_CpuSchedule == "rr" || _CpuSchedule == "fcfs") {
                        CpuScheduler.roundRobin();
                        _ClockTicks = 1;
                    }
                    else {
                        if (_CurrentProgram.state == PS_Terminated) {
                            for (var i = 0; i < _ReadyQueue.length; i++) {
                                if (_ReadyQueue[i].PID == _CurrentProgram.PID) {
                                    _ReadyQueue.splice(i, 1);

                                    //Restore memory after program finishes running and update memory table
                                    _MemoryManager.resetPartition(_CurrentProgram);
                                    _MemoryManager.updateMemTable(_CurrentProgram);

                                    _MemoryManager.deleteRowPcb(_CurrentProgram);
                                    break;
                                }

                            }
                        }

                        this.isExecuting = true;
                        CpuScheduler.priority();

                        //execute format command if it is activated
                        if (_FormatCommandActive == true) {
                            _DeviceDriverFileSystem.format();
                        }

                    }

                    if (_MemoryManager.fetch(this.startIndex) != "00" && _CurrentProgram.state != PS_Running) {
                        this.startIndex = _CurrentProgram.startIndex;
                        _CurrentProgram.state = PS_Running;
                        this.isExecuting = true;
                    }
                    this.cycle();

                }
                else {

                    //remove the only program from ready queue
                   // alert("Removing the only program " + _CurrentProgram.PID + "  " + this.isExecuting);

                    _ReadyQueue.splice(0, 1);

                    _MemoryManager.resetPartition(_CurrentProgram);
                    _MemoryManager.updateMemTable(_CurrentProgram);
                    _MemoryManager.deleteRowPcb(_CurrentProgram);
                    _StdOut.advanceLine();
                    _StdOut.putText(">");

                    
                    //alert("ID " + _CurrentProgram.PID + " location =" + _CurrentProgram.location + " bool =" + _RunOne);
                    //roll program that was swapped during the single run back into memory
                    /*if (_RunOne == true && _RunHDProgram.location == "Hard Disk") {

                        //alert("2. ID " + _RunHDProgram.PID + " location =" + _CurrentProgram.location );
                        CpuScheduler.rollin(_RunHDProgram);
                        _RunHDProgram.location = "Memory";
                        _MemoryManager.updatePcbTable(_RunHDProgram);
                        _RunOne = false;
                    }*/
                    if (_RunOne == true && _CurrentProgram.location == "Memory") {
                        //load a program from HD to memory if there is an empty partition in memory
                        if (_ResidentQueue.length > 1) {
                            for (var i = 0; i < _ResidentQueue.length; i++) {
                                if (_ResidentQueue[i].location == "Hard Disk") {
                                    if (_ResidentQueue[i].base == -1) {
                                        _ResidentQueue[i].startIndex = _CurrentProgram.base;
                                        //alert("New prog start index =" + nextProg.startIndex);
                                    } else {
                                        //Get the start index for the next program in a particular segment
                                        _ResidentQueue[i].startIndex = (_ResidentQueue[i].startIndex - _ResidentQueue[i].base) + _CurrentProgram.base;
                                    }
                                    _ResidentQueue[i].base = _CurrentProgram.base;
                                    _ResidentQueue[i].limit = _CurrentProgram.limit;
                                    CpuScheduler.rollin(_ResidentQueue[i]);
                                    _ResidentQueue[i].location = "Memory";
                                    _MemoryManager.updatePcbTable(_ResidentQueue[i]);
                                    _RunOne = false;

                                    break;

                                }

                            }
                        }
                    }

                    this.init();
                    _IR = "NA";
                    _MemoryManager.updateCpuTable();
                    _DONE = true;
                }

            }

        }
    }
}

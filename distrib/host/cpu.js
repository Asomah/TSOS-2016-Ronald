///<reference path="../globals.ts" />
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
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(startIndex, PC, IR, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (startIndex === void 0) { startIndex = 0; }
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = _IR; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.startIndex = startIndex;
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.IR = "NA";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        //Decode Instructions
        Cpu.prototype.executeProgram = function (opCode) {
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
                //alert("8D " + _Base)
                if (destAddress <= _CurrentProgram.limit) {
                    _MemoryArray[destAddress] = this.Acc.toString(16);
                    alert("Memory=" + _MemoryArray[destAddress] + " Acc =" + this.Acc.toString(16) + " destAddress=" + destAddress);
                }
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
                alert("AE -- Xreg" + this.Xreg + " Location =" + value + " Address =" + address);
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
                //var newV = _MemoryManager.fetch(parseInt(memAddress, 16));
                var xValue = parseInt(value, 16);
                alert("PrevX =" + xValue + " currentX =" + this.Xreg);
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
                alert("Zflag = " + this.Zflag);
                //Branch n bytes if Z flag is zero
                if (this.Zflag == 0) {
                    this.PC++;
                    var jump = parseInt(_MemoryManager.fetch(++this.startIndex), 16);
                    alert("Mem Elem =" + _MemoryManager.fetch(this.startIndex));
                    alert("Start Index =" + this.startIndex + " jump =" + jump);
                    // Fetch the next byte and Branch
                    var nextAddress = this.startIndex + jump;
                    var pc = this.startIndex + jump;
                    alert("Next Address" + nextAddress);
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
                }
                else {
                    this.startIndex++;
                    this.PC++;
                }
                alert(opCode + " :: This.PC=" + this.PC + " This.startIndex =" + this.startIndex);
            }
            else if (opCode == "EE") {
                _IR = opCode;
                //Increament the value of a byte
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
            }
            else if (opCode == "FF") {
                _IR = opCode;
                if (this.Xreg == 1) {
                    _StdOut.putText(_CPU.Yreg.toString());
                }
                else if (this.Xreg == 2) {
                    var currAddr = _CPU.Yreg;
                    alert("FF currAddres =" + currAddr);
                    var str = "";
                    while (_MemoryManager.fetch(currAddr) !== "00") {
                        var charAscii = parseInt(_MemoryManager.fetch(currAddr), 16);
                        str += String.fromCharCode(charAscii);
                        currAddr++;
                    }
                    _StdOut.putText(str);
                }
            }
            else {
                //Stop process
                //_CurrentProgram.state = PS_Terminated;
                //_MemoryManager.updateCpuTable();
                _StdOut.putText("NOT VALID PROGRAM");
            }
            this.PC++;
            this.startIndex++;
            alert("Opcode =" + opCode + " Counter =" + this.startIndex);
        };
        Cpu.prototype.roundRobin = function () {
            //alert ("Checking Round Robin");
            if (_ClockTicks < _Quantum) {
                _ClockTicks++;
            }
            else {
                //set clockTicks to 1
                _ClockTicks = 1;
                // alert("2Clock Ticks " + _ClockTicks);
                //perform context switching
                this.contextSwitch();
            }
        };
        //Context switch 
        Cpu.prototype.contextSwitch = function () {
            //break and save all instances of current program 
            //this.executeProgram("00");
            //_IR = "00";
            _CurrentProgram.startIndex = this.startIndex;
            _CurrentProgram.PC = this.PC;
            _CurrentProgram.Acc = this.Acc;
            _CurrentProgram.Xreg = this.Xreg;
            _CurrentProgram.Yreg = this.Yreg;
            _CurrentProgram.Zflag = this.Zflag;
            //_CurrentProgram.state = PS_Ready;
            //alert("1. Xreg=" + _CurrentProgram.Xreg + " YReg=" + _CurrentProgram.Yreg + " Acc=" + _CurrentProgram.Acc + " zFlag=" + _CurrentProgram.Zflag);
            //Load all instances of next program
            _CurrentProgram = this.getNextprogram();
            this.startIndex = _CurrentProgram.startIndex;
            this.PC = _CurrentProgram.PC;
            this.Acc = _CurrentProgram.Acc;
            this.Xreg = _CurrentProgram.Xreg;
            this.Yreg = _CurrentProgram.Yreg;
            this.Zflag = _CurrentProgram.Zflag;
            //alert("2. Xreg=" + _CurrentProgram.Xreg + " YReg=" + _CurrentProgram.Yreg + " Acc=" + _CurrentProgram.Acc + " zFlag=" + _CurrentProgram.Zflag);
            //this.isExecuting = true;
            if (_CurrentProgram.state != PS_Terminated) {
                //this.startIndex = _CurrentProgram.startIndex;
                if (_MemoryManager.fetch(this.startIndex) != "00") {
                    _CurrentProgram.state = PS_Running;
                    _IR = "NA";
                }
            }
            else {
                this.isExecuting = false;
            }
        };
        Cpu.prototype.getNextprogram = function () {
            var nextProgram = new TSOS.Pcb();
            if (_ReadyQueue.length == 1) {
                nextProgram = _CurrentProgram;
            }
            else {
                for (var i = 0; i < _ReadyQueue.length; i++) {
                    //Get next program in queue
                    if (_CurrentProgram.PID == _ReadyQueue[i].PID) {
                        _CurrentProgram.state = PS_Ready;
                        _MemoryManager.updatePcbTable(_CurrentProgram);
                        //set next program to the program in the begining of the queue if the last program in queue is curreent
                        if (i == _ReadyQueue.length - 1) {
                            nextProgram = _ReadyQueue[0];
                        }
                        else {
                            nextProgram = _ReadyQueue[i + 1];
                        }
                        //alert(_CurrentProgram.PID + " " + nextProgram.PID);
                        break;
                    }
                }
            }
            return nextProgram;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (_MemoryManager.fetch(this.startIndex) != "00") {
                // alert("before " + this.PC);
                this.executeProgram(_MemoryManager.fetch(this.startIndex));
                _CurrentProgram.state = PS_Running;
                //alert("Updating PCBTABLE");
                _MemoryManager.updatePcbTable(_CurrentProgram);
                // alert("Updating PCTABLE");
                _MemoryManager.updateCpuTable();
                //alert("Starting ...")
                //alert("after " + this.PC);
                this.roundRobin();
            }
            else {
                this.isExecuting = false;
                //set the next program to execute
                _CurrentProgram.state = PS_Terminated;
                _MemoryManager.updatePcbTable(_CurrentProgram);
                //TO DO :: Clear memory after each process
                //Restore memory after program finishes running and update memory table
                //_MemoryManager.resetMem();
                //remove program from ready queue
                for (var i = 0; i < _ReadyQueue.length; i++) {
                    if (_ReadyQueue[i].PID == _CurrentProgram.PID && _ReadyQueue[i].state == PS_Terminated) {
                        _ReadyQueue.splice(i, 1);
                        _MemoryManager.deleteRowPcb(_CurrentProgram);
                        break;
                    }
                }
                if (_RunAll == true) {
                    for (var i = 0; i < _ReadyQueue.length; i++) {
                        if (_ReadyQueue[i].state != PS_Terminated) {
                            _CurrentProgram = _ReadyQueue[i];
                            this.startIndex = _CurrentProgram.base;
                            if (_MemoryManager.fetch(this.startIndex) != "00") {
                                _CurrentProgram.state = PS_Running;
                                this.init();
                                this.isExecuting = true;
                                this.cycle();
                                break;
                            }
                        }
                    }
                }
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));

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
            if (startIndex === void 0) { startIndex = _BaseProgram; }
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
            this.IR = _IR;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        //Decode Instructions
        Cpu.prototype.loadAcc = function () {
            //Load the accumulator with constant
            //Get Next byte from memory
            var memAddress = _MemoryManager.fetch(++this.PC);
            //convert constant from hex to base 10 and set it to accumulator
            this.Acc = parseInt(memAddress, 16);
            _Acc = this.Acc;
        };
        Cpu.prototype.executeProgram = function (opCode) {
            if (opCode == "A9") {
                _IR = opCode;
                //load the accumulator with a constant
                this.Acc = parseInt(_MemoryManager.fetch(++this.PC), 16);
            }
            else if (opCode == "AD") {
                _IR = opCode;
                //load the accumulator from memory
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC) + memAddress;
                this.Acc = parseInt(memAddress, 16);
            }
            else if (opCode == "8D") {
                _IR = opCode;
                // Store the accumulator in memory
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC) + memAddress;
                var decAddress = parseInt(memAddress, 16);
                _MemoryArray[decAddress] = this.Acc.toString(16);
            }
            else if (opCode == "6D") {
                _IR = opCode;
                // Add with carry
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC) + memAddress;
                var value = _MemoryManager.fetch(parseInt(memAddress, 16));
                this.Acc += parseInt(value, 16);
            }
            else if (opCode == "A2") {
                _IR = opCode;
                // Load the X register with a constant
                this.Xreg = parseInt(_MemoryManager.fetch(++this.PC), 16);
            }
            else if (opCode == "AE") {
                _IR = opCode;
                // Load the X register from memory
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC) + memAddress;
                var value = _MemoryManager.fetch(parseInt(memAddress, 16));
                this.Xreg = parseInt(value, 16);
            }
            else if (opCode == "A0") {
                _IR = opCode;
                // Load the Y register with a constant
                this.Yreg = parseInt(_MemoryManager.fetch(++this.PC), 16);
            }
            else if (opCode == "AC") {
                _IR = opCode;
                // Load the Y register from memory
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC) + memAddress;
                var value = _MemoryManager.fetch(parseInt(memAddress, 16));
                this.Yreg = parseInt(value, 16);
            }
            else if (opCode == "EA") {
                _IR = opCode;
            }
            else if (opCode == "00") {
                _IR = opCode;
                //Break
                _CurrentProgram.PC = this.PC;
                _CurrentProgram.Acc = this.Acc;
                _CurrentProgram.Xreg = this.Xreg;
                _CurrentProgram.Yreg = this.Yreg;
                _CurrentProgram.Zflag = this.Zflag;
            }
            else if (opCode == "EC") {
                _IR = opCode;
                // Compare a byte in memory to the X register
                // Sets Zflag if equal
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC) + memAddress;
                var value = _MemoryManager.fetch(parseInt(memAddress, 16));
                if (parseInt(value, 16) == this.Xreg) {
                    this.Zflag = 1;
                }
                else {
                    this.Zflag = 0;
                }
            }
            else if (opCode == "D0") {
                _IR = opCode;
                // Branch n bytes if Zflag = 0
                var jump = parseInt(_MemoryManager.fetch(++this.PC), 16);
                if (!this.Zflag) {
                    // If the jump + the current program couter is more than the memory limit,
                    // we loop around and go up the remainder from 0
                    var memAdd = this.PC + jump;
                    if (memAdd > _ProgramSize) {
                        memAdd = memAdd - _ProgramSize;
                    }
                    this.PC = memAdd;
                }
            }
            else if (opCode == "EE") {
                _IR = opCode;
                // Increment the value of a byte
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC) + memAddress;
                var decAddress = parseInt(memAddress, 16);
                var value = _MemoryManager.fetch(decAddress);
                //JustMemoryThings.storeOp((parseInt(value, 16) + 1).toString(16), decAddress);
                _MemoryArray[decAddress] = (parseInt(value, 16) + 1).toString(16);
            }
            else if (opCode == "FF") {
                _IR = opCode;
                if (this.Xreg == 1) {
                    _StdOut.putText(_CPU.Yreg.toString());
                }
                else if (this.Xreg == 2) {
                    var currAddr = _CPU.Yreg;
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
            }
            this.PC++;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            //increase clock cycle if program is executiing 
            /*if (this.isExecuting == true){
                CPU_CLOCK_INTERVAL = 500;
            }
            else{
                CPU_CLOCK_INTERVAL = 100;
            }*/
            //var program = _ProgramInput.replace(/[\s]/g, "");
            if (_MemoryManager.fetch(this.PC) != "00") {
                this.executeProgram(_MemoryManager.fetch(this.PC));
                _CurrentProgram.state = PS_Running;
                _MemoryManager.updatePcbTable(_CurrentProgram);
                _MemoryManager.updateCpuTable();
            }
            else {
                this.isExecuting = false;
                //set the next program to execute
                alert(_BaseProgram + "First");
                _BaseProgram = _BaseProgram + 256;
                alert(_BaseProgram + "Second");
                _CurrentProgram.state = PS_Terminated;
                _MemoryManager.updatePcbTable(_CurrentProgram);
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));

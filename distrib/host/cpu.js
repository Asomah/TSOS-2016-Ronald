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
        function Cpu(counter, PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (counter === void 0) { counter = 0; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.counter = counter;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        //Get the next two bytes from programm input
        Cpu.prototype.getTwoBytes = function (memory) {
            var bytes = memory[this.counter] + memory[this.counter + 1];
            this.counter = this.counter + 2;
            return bytes;
        };
        //Get the next byte from programm input
        Cpu.prototype.getOneByte = function (memory) {
            var bytes = memory[this.counter];
            this.counter = this.counter + 1;
            return bytes;
        };
        Cpu.prototype.executeProgram = function () {
            var memory = _MemoryArray;
            var opCode = this.getOneByte(memory);
            if (opCode == "A9") {
                //Load the accumulator with constant
                // Load the the next byte 
                var hex = this.getOneByte(memory);
                //convert constant from hex to base 10 and set it to accumulator
                this.Acc = parseInt(hex, 16);
                _Acc = this.Acc;
            }
            else if (opCode == "AD") {
                // Load the acccumulator from memeory
                // Load the the next two bytes and switch them
                var memAddress = this.getOneByte(memory);
                memAddress = this.getOneByte(memory) + memAddress;
                var value = memory[parseInt(memAddress, 16)];
                this.Acc = parseInt(value, 16);
                _Acc = parseInt(value, 16);
            }
            else if (opCode == "8D") {
                //Store accumulator in memory
                // Load the the next two bytes 
                var memAddress = this.getOneByte(memory);
                memAddress = this.getOneByte(memory) + memAddress;
                var destAddress = parseInt(memAddress, 16);
                if (destAddress <= _ProgramSize) {
                    memory[destAddress] = this.Acc.toString(16);
                }
            }
            else if (opCode == "6D") {
                //Add with carry
                // Load the the next two bytes 
                var memAddress = this.getOneByte(memory);
                memAddress = this.getOneByte(memory) + memAddress;
                var value = memory[parseInt(memAddress, 16)];
                this.Acc = this.Acc + parseInt(value, 16);
                _Acc = this.Acc + parseInt(value, 16);
            }
            else if (opCode == "A2") {
                //Load the X resgister with a constant
                // Load the the next byte 
                var numValue = this.getOneByte(memory);
                this.Xreg = parseInt(numValue, 16);
                _Xreg = parseInt(numValue, 16);
            }
            else if (opCode == "AE") {
                //Load the X register from memory
                // Load the the next two bytes 
                var memAddress = this.getOneByte(memory);
                memAddress = this.getOneByte(memory) + memAddress;
                var value = memory[parseInt(memAddress, 16)];
                this.Xreg = parseInt(value, 16);
                _Xreg = parseInt(value, 16);
            }
            else if (opCode == "A0") {
                //Load Y register with a constant 
                // Load the the next byte 
                var numValue = this.getOneByte(memory);
                this.Yreg = parseInt(numValue, 16);
                _Yreg = parseInt(numValue, 16);
            }
            else if (opCode == "AC") {
                //Load Y register from memory 
                // Load the the next two bytes 
                var memAddress = this.getOneByte(memory);
                memAddress = this.getOneByte(memory) + memAddress;
                var value = memory[parseInt(memAddress, 16)];
                this.Yreg = parseInt(value, 16);
                _Yreg = parseInt(value, 16);
            }
            else if (opCode == "EA") {
            }
            else if (opCode == "00") {
                //Break
                _CPU.counter = this.counter;
                _CPU.PC = this.PC;
                _CPU.Acc = this.Acc;
                _CPU.Xreg = this.Xreg;
                _CPU.Yreg = this.Yreg;
                _CPU.Zflag = this.Zflag;
            }
            else if (opCode == "EC") {
                //Compare a byte in memory to the X register
                //Set the Z flag if equal
                // Load the the next two bytes 
                var memAddress = this.getOneByte(memory);
                memAddress = this.getOneByte(memory) + memAddress;
                var value = memory[parseInt(memAddress, 16)];
                var xValue = parseInt(value, 16);
                if (xValue != this.Xreg) {
                    this.Zflag = 0;
                    _Zflag = 0;
                }
                else {
                    this.Zflag = 1;
                    _Zflag = 1;
                }
            }
            else if (opCode == "D0") {
            }
            else if (opCode == "EE") {
                //Increament the value of a byte
                var memAddress = this.getOneByte(memory);
                memAddress = this.getOneByte(memory) + memAddress;
                var address = parseInt(memAddress, 16);
                var value = memory[address];
                var newValue = parseInt(value, 16) + 1;
                if (address <= _ProgramSize) {
                    value = newValue.toString(16);
                }
            }
            else if (opCode == "FF") {
                //Do a system call
                if (this.Xreg === 1) {
                    _StdOut.putText("" + this.Yreg);
                }
            }
            this.PC = this.PC + 1;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.executeProgram();
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));

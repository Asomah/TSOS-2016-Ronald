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
        Cpu.prototype.getTwoBytes = function (program) {
            var bytes = program[this.counter] + program[this.counter + 1] + program[this.counter + 2] + program[this.counter + 3];
            this.counter = this.counter + 4;
            return bytes;
        };
        //Get the next byte from programm input
        Cpu.prototype.getOneByte = function (program) {
            var bytes = program[this.counter] + program[this.counter + 1];
            this.counter = this.counter + 2;
            return bytes;
        };
        Cpu.prototype.loadCode = function (program) {
            var program = _ProgramInput.replace(" ", "");
            var opCode = this.getOneByte(program);
            if (opCode == "A9") {
                //Load the accumulator with constant
                // Load the the next byte 
                var hex = this.getOneByte(program);
                //convert constant from hex to base 10 and set it to accumulator
                this.Acc = parseInt(hex, 16);
            }
            else if (opCode == "AD") {
                // Load the acccumulator from memeory
                // Load the the next two bytes 
                var hex = this.getTwoBytes(program);
            }
            else if (opCode == "8D") {
                //Store accumulator in memory
                // Load the the next two bytes 
                var hex = this.getTwoBytes(program);
            }
            else if (opCode == "6D") {
                //Add with carry
                // Load the the next two bytes 
                var hex = this.getTwoBytes(program);
            }
            else if (opCode == "A2") {
                //Load the X resgister with a constant
                // Load the the next byte 
                var hex = this.getOneByte(program);
            }
            else if (opCode == "AE") {
                //Load the X register from memory
                // Load the the next two bytes 
                var hex = this.getTwoBytes(program);
            }
            else if (opCode == "A0") {
                //Load Y register with a constant 
                // Load the the next byte 
                var hex = this.getOneByte(program);
            }
            else if (opCode == "AC") {
                //Load Y register from memory 
                // Load the the next two bytes 
                var hex = this.getTwoBytes(program);
            }
            else if (opCode == "EA") {
            }
            else if (opCode == "00") {
            }
            else if (opCode == "EC") {
                //Compare a byte in memory to the X register
                //Set the Z flag if equal
                // Load the the next two bytes 
                var hex = this.getTwoBytes(program);
            }
            else if (opCode == "D0") {
            }
            else if (opCode == "EE") {
            }
            else if (opCode == "FF") {
            }
            this.PC = this.PC + 1;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));

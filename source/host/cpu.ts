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

module TSOS {

    export class Cpu {

        constructor(public counter: number = 0,
            public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public Zflag: number = 0,
            public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        //Decode Instructions
        public loadAcc() {
            //Load the accumulator with constant

            //Get Next byte from memory
            this.PC++;
            var memAddress = _MemoryManager.fetch(this.PC);

            //convert constant from hex to base 10 and set it to accumulator
            this.Acc = parseInt(memAddress, 16);
            _Acc = this.Acc;

        }


        public executeProgram(opCode) {

            if (opCode == "A9") {
                _IR = opCode;
                this.loadAcc();
                alert(opCode);
            }
            else if (opCode == "AD") {
                _IR = opCode;
                // Load the acccumulator from memeory

                // Load the the next two bytes and switch them
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC); + memAddress;

                var value = _MemoryArray[parseInt(memAddress, 16)];
                this.Acc = parseInt(value, 16);
                _Acc = parseInt(value, 16);
                alert(opCode);


            }
            else if (opCode == "8D") {
                _IR = opCode;
                //Store accumulator in memory

                // Load the the next two bytes 
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC); + memAddress;

                var destAddress = parseInt(memAddress, 16)

                if (destAddress <= _ProgramSize) {
                    _MemoryArray[destAddress] = this.Acc.toString(16);
                }

                alert(opCode);
            }
            else if (opCode == "6D") {
                _IR = opCode;
                //Add with carry

                // Load the the next two bytes 
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC); + memAddress;

                var value = _MemoryArray[parseInt(memAddress, 16)];
                this.Acc = this.Acc + parseInt(value, 16);
                _Acc = this.Acc + parseInt(value, 16);
                alert(opCode);

            }
            else if (opCode == "A2") {
                _IR = opCode;
                //Load the X resgister with a constant

                // Load the the next byte 
                var numValue = _MemoryManager.fetch(++this.PC);
                this.Xreg = parseInt(numValue, 16);
                _Xreg = parseInt(numValue, 16);
                alert(opCode);


            }
            else if (opCode == "AE") {
                _IR = opCode;
                //Load the X register from memory

                // Load the the next two bytes 
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC) + memAddress;

                var value = _MemoryArray[parseInt(memAddress, 16)];
                this.Xreg = parseInt(value, 16);
                _Xreg = parseInt(value, 16);
                alert(opCode);

            }
            else if (opCode == "A0") {
                _IR = opCode;
                //Load Y register with a constant 

                // Load the the next byte 
                var numValue = _MemoryManager.fetch(++this.PC);
                this.Yreg = parseInt(numValue, 16);
                _Yreg = parseInt(numValue, 16);
                alert(opCode);


            }
            else if (opCode == "AC") {
                _IR = opCode;
                //Load Y register from memory 

                // Load the the next two bytes 
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC); + memAddress;

                var value = _MemoryArray[parseInt(memAddress, 16)];
                this.Yreg = parseInt(value, 16);
                _Yreg = parseInt(value, 16);
                alert(opCode);


            }
            else if (opCode == "EA") {
                _IR = opCode;
                //Do Nothing

                alert(opCode);


            }
            else if (opCode == "00") {
                _IR = opCode;
                //Break
                _CPU.counter = this.counter;
                _CPU.PC = this.PC;
                _CPU.Acc = this.Acc;
                _CPU.Xreg = this.Xreg;
                _CPU.Yreg = this.Yreg;
                _CPU.Zflag = this.Zflag;

                alert(opCode);

            }
            else if (opCode == "EC") {
                _IR = opCode;
                //Compare a byte in memory to the X register
                //Set the Z flag if equal

                // Load the the next two bytes 
                var memAddress = _MemoryManager.fetch(++this.PC);;
                memAddress = _MemoryManager.fetch(++this.PC); + memAddress;

                var value = _Memory[parseInt(memAddress, 16)];
                var xValue = parseInt(value, 16);
                if (xValue != this.Xreg) {
                    this.Zflag = 0;
                    _Zflag = 0;
                }
                else {
                    this.Zflag = 1;
                    _Zflag = 1;
                }


                alert(opCode);
            }
            else if (opCode == "D0") {
                _IR = opCode;
                //Branch n bytes if Z flag is zero

                alert(opCode);


            }
            else if (opCode == "EE") {
                _IR = opCode;
                //Increament the value of a byte
                var memAddress = _MemoryManager.fetch(++this.PC);
                memAddress = _MemoryManager.fetch(++this.PC); + memAddress;
                var address = parseInt(memAddress, 16);

                var value = _MemoryArray[address];
                var newValue = parseInt(value, 16) + 1;

                if (address <= _ProgramSize) {
                    value = newValue.toString(16);
                }

                alert(opCode);
            }
            else if (opCode == "FF") {
                _IR = opCode;
                //Do a system call
                if (this.Xreg === 1) {
                    _StdOut.putText("" + this.Yreg);

                }

                alert(opCode);

            }

            this.PC++;


        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            var i = 0;
            var program = _ProgramInput.replace(/[\s]/g, "");
            while (i < program.length / 2) {

                if (_MemoryManager.fetch(this.PC) != "00") {
                    this.executeProgram(_MemoryManager.fetch(this.PC));
                    _MemoryManager.updatePcbTable();
                    i++;
                }
                else {
                    break;
                }

            }

        }
    }
}

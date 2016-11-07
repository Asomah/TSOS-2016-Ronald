///<reference path="../globals.ts" />
///<reference path="../os/pcb.ts" />
var TSOS;
(function (TSOS) {
    var CpuScheduler = (function () {
        function CpuScheduler() {
        }
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

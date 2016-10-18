///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(PC, IR, Acc, Xreg, Yreg, Zflag, PID, base, limit, startIndex, state, isExecuting, pcbProgram) {
            if (PC === void 0) { PC = _PC; }
            if (IR === void 0) { IR = _IR; }
            if (Acc === void 0) { Acc = _Acc; }
            if (Xreg === void 0) { Xreg = _Xreg; }
            if (Yreg === void 0) { Yreg = _Yreg; }
            if (Zflag === void 0) { Zflag = _Zflag; }
            if (PID === void 0) { PID = _PID; }
            if (base === void 0) { base = _Base; }
            if (limit === void 0) { limit = _ProgramSize - 1; }
            if (startIndex === void 0) { startIndex = _PcbStartIndex; }
            if (state === void 0) { state = PS_New; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (pcbProgram === void 0) { pcbProgram = ""; }
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.PID = PID;
            this.base = base;
            this.limit = limit;
            this.startIndex = startIndex;
            this.state = state;
            this.isExecuting = isExecuting;
            this.pcbProgram = pcbProgram;
        }
        return Pcb;
    }());
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));

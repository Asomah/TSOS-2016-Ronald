///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(PC, Acc, Xreg, Yreg, Zflag, PID, base, limit, state, isExecuting, pcbProgram) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (PID === void 0) { PID = _PID; }
            if (base === void 0) { base = _Base; }
            if (limit === void 0) { limit = _ProgramSize - 1; }
            if (state === void 0) { state = PS_New; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (pcbProgram === void 0) { pcbProgram = ""; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.PID = PID;
            this.base = base;
            this.limit = limit;
            this.state = state;
            this.isExecuting = isExecuting;
            this.pcbProgram = pcbProgram;
        }
        return Pcb;
    }());
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));

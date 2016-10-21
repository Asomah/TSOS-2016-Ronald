///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(PC, IR, Acc, Xreg, Yreg, Zflag, PID, base, limit, state, startIndex, pcbProgram) {
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = _IR; }
            if (Acc === void 0) { Acc = _Acc; }
            if (Xreg === void 0) { Xreg = _Xreg; }
            if (Yreg === void 0) { Yreg = _Yreg; }
            if (Zflag === void 0) { Zflag = _Zflag; }
            if (PID === void 0) { PID = _PID; }
            if (base === void 0) { base = _Base; }
            if (limit === void 0) { limit = (_Base + _ProgramSize - 1); }
            if (state === void 0) { state = PS_New; }
            if (startIndex === void 0) { startIndex = 0; }
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
            this.state = state;
            this.startIndex = startIndex;
            this.pcbProgram = pcbProgram;
        }
        return Pcb;
    }());
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));

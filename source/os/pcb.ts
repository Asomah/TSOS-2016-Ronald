///<reference path="../globals.ts" />

module TSOS {
  
  export class Pcb {
    constructor(public PC: number = _PC,
                public IR: string = _IR,
                public Acc: number = _Acc,
                public Xreg: number = _Xreg,
                public Yreg: number = _Yreg,
                public Zflag: number = _Zflag,
                public PID: number = _PID,
                public base: number = _Base,
                public limit: number = _ProgramSize - 1,
                public state: string = PS_New,
                public pcbProgram :string = "") {
    }
  }
}
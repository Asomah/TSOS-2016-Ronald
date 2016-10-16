///<reference path="../globals.ts" />

module TSOS {
  
  export class Pcb {
    constructor(public PC: number = 0,
                public Acc: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0,
                public PID: number = _PID,
                public base: number = _Base,
                public limit: number = _ProgramSize - 1,
                public state: number = PS_New,
                public isExecuting: boolean = false,
                public pcbProgram :string = "") {
    }
  }
}
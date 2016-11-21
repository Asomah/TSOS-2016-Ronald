///<reference path="../globals.ts" />

module TSOS {
  
  export class Pcb {
    constructor(public PC: number = 0,
                public IR: string = _IR,
                public Acc: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0,
                public PID: number = _PID,
                public base: number = 0,
                public limit: number = 0,
                public state: string = PS_New,
                public startIndex: number = 0,
                public waitTime: number = 0,
                public taTime: number = 0,
                public priority: number = 120,
                public pcbProgram :string = "") {
    }

    public init(){
      this.PC = 0;
      this.IR = "NA";

    }
  }
}
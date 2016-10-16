///<reference path="../globals.ts" />

module TSOS {
  
  export class Pcb {
    constructor(public PC: number = 0,
                public Acc: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0,
                public PID: number = _PID,
                public state: number = PS_NEW,
                public priority: number = _PRIORITY) {
    }
  }
}
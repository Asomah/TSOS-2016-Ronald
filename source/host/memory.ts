///<reference path="../globals.ts" />


module TSOS {
    export class Memory {
       
       //Create default memory
       public init(): void {
           for (var i = 0; i < _ProgramSize; i++){
               _MemoryArray.push("00");
           }
                  
        }

    }
}

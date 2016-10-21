///<reference path="../globals.ts" />


module TSOS {
    export class Memory {
         constructor(
            public base: number = 0,
            public limit: number = _MemorySize -1) {

            }
       
       //Create default memory
       public init(): void {
           for (var i = 0; i < _MemorySize; i++){
               _MemoryArray[i] = "00";
           }  
                  
        }

    }
}

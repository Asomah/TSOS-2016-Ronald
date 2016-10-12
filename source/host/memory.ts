///<reference path="../globals.ts" />


module TSOS {
    export class Memory {
        constructor(public memoryArr:Array <string> = new Array()) {

        }
       public init(): void {
           for (var i = 0; i<_ProgramSize; i++){
               this.memoryArr[i] = "00";
           }
            
        }

    }
}

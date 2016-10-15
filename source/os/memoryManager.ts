///<reference path="../globals.ts" />

module TSOS {

export class MemoryManager {

      //Load programInput into memory 
      public loadProgToMem(){
          var programInput = _ProgramInput.replace(/[\s]/g, "");

          for (var i = 0 ; i < programInput.length/2; i=+2){
                _MemoryArray[i]=programInput[i] + programInput[i+1];
          }


      }


   }

}
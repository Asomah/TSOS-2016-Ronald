///<reference path="../globals.ts" />

module TSOS {

export class MemoryManager {

      //Load programInput into memory 
      public loadProgToMem(){
          /*
          Get program input from html and remove all spaces from program input
          put program input into memory if current address is less than programSize
          Increase PID by one, Create a new instance of PCB by one and push cusrrent PCB to Resident queue 
          */
          var programInput = _ProgramInput.replace(/[\s]/g, "");
          var j = _CurrMemIndex;
          
          for (var i = 0 ; i < programInput.length; i++){
                if (_CurrMemIndex < _ProgramSize){
                _MemoryArray[j]=programInput[i] + programInput[i+1];
                j++;
                i++;
                }
            }
            _CurrMemIndex = j;
          
          _PID++;
          _Pcb = new Pcb();
          _Pcb.pcbProgram = programInput;
          _ResidentQueue.push(_Pcb);
          
          _StdOut.putText("PID " + _PID + " Loaded");

      }


      public updateMemTable():void {
         //load program to memory
         this.loadProgToMem();
         
         //get Memory table and upadte memory cells
         var memoryTable : HTMLTableElement = <HTMLTableElement> document.getElementById("memoryTable");
         var rows = memoryTable.getElementsByTagName("tr");


        var memIndex = 0;
         for (var i = 0 ; i < rows.length; i++){
                   
                    var cells = rows[i].cells;
                    for (var j = 1 ; j < cells.length; j++){
                     rows[i].cells[j].innerHTML = _MemoryArray[memIndex];
                     memIndex++;
               }                  
               }
         

        }


   }

}
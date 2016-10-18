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
            //Increase current memory index by 2 so that new process starts by 2 bytes offset
            _CurrMemIndex = j + 2;
          
          _PID++;
          _Pcb = new Pcb();
          _Pcb.pcbProgram = programInput;
          _Pcb.state = PS_Ready;
          _ResidentQueue.push(_Pcb);
          
          _StdOut.putText("PID " + _PID + " Loaded");


          //Create row and insert into PCB table
          var myTable: HTMLTableElement = <HTMLTableElement> document.getElementById("pcbTable");
          var newRow   = myTable.insertRow(myTable.rows.length);
          //myTable.insertRow(myTable.rows.length);

          // Insert a cell in the row at index 0
          var newCell1  = newRow.insertCell(0);
         // Append a text node to the cell
         var newText  = document.createTextNode(_Pcb.PID + "");
         newCell1.appendChild(newText);

         // Insert a cell in the row at index 1
          var newCell2  = newRow.insertCell(1);
         // Append a text node to the cell
         var newText  = document.createTextNode(_Pcb.PC + "");
         newCell2.appendChild(newText);

         // Insert a cell in the row at index 2
          var newCell3  = newRow.insertCell(2);
         // Append a text node to the cell
         var newText  = document.createTextNode(_Pcb.IR + "");
         newCell3.appendChild(newText);

         // Insert a cell in the row at index 4
          var newCell4  = newRow.insertCell(3);
         // Append a text node to the cell
         var newText  = document.createTextNode(_Pcb.Acc + "");
         newCell4.appendChild(newText);

         // Insert a cell in the row at index 5
          var newCell5  = newRow.insertCell(4);
         // Append a text node to the cell
         var newText  = document.createTextNode(_Pcb.Xreg + "");
         newCell5.appendChild(newText);

         // Insert a cell in the row at index 6
          var newCell6  = newRow.insertCell(5);
         // Append a text node to the cell
         var newText  = document.createTextNode(_Pcb.Yreg + "");
         newCell6.appendChild(newText);
          
         // Insert a cell in the row at index 7
          var newCell7  = newRow.insertCell(6);
         // Append a text node to the cell
         var newText  = document.createTextNode(_Pcb.Zflag + "");
         newCell7.appendChild(newText); 

         // Insert a cell in the row at index 8
          var newCell8  = newRow.insertCell(7);
         // Append a text node to the cell
         var newText  = document.createTextNode(_Pcb.base + "");
         newCell8.appendChild(newText);

         // Insert a cell in the row at index 9
          var newCell9  = newRow.insertCell(8);
         // Append a text node to the cell
         var newText  = document.createTextNode(_Pcb.limit + "");
         newCell9.appendChild(newText);

         // Insert a cell in the row at index 10
          var newCell10  = newRow.insertCell(9);
         // Append a text node to the cell
         var newText  = document.createTextNode(_Pcb.state + "");
         newCell10.appendChild(newText);

          //alert(myTable.rows.length)

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

        public updatePcbTable():void {
         //load program to memory
         //this.loadProgToMem();
         
         //get Memory table and upadte memory cells
         var pcbTable : HTMLTableElement = <HTMLTableElement> document.getElementById("pcbTable");
         var rows = pcbTable.getElementsByTagName("tr");


         for (var i = 1 ; i < rows.length; i++){
                   
                    var cells = rows[i].cells;
                        for (var k = 0 ; k < _ResidentQueue.length; k++){

                              if (_ResidentQueue[k].state == PS_Running && rows[i].cells[0].innerHTML == _ResidentQueue[k].PID){
                                  rows[i].cells[0].innerHTML = _ResidentQueue[k].PID + "";
                                  rows[i].cells[1].innerHTML = _CPU.PC + "";
                                  rows[i].cells[2].innerHTML = _IR;
                                  rows[i].cells[3].innerHTML = _Acc + "";
                                  rows[i].cells[4].innerHTML = _Xreg + "";
                                  rows[i].cells[5].innerHTML = _Yreg + "";
                                  rows[i].cells[6].innerHTML = _Zflag + "";
                                  rows[i].cells[7].innerHTML = _ResidentQueue[k].base + "";
                                  rows[i].cells[8].innerHTML = _ResidentQueue[k].limit + "";
                                  rows[i].cells[9].innerHTML = _ResidentQueue[k].state;
                                  break;
                              }
                              if (_ResidentQueue[k].state == PS_Terminated && rows[i].cells[0].innerHTML == _ResidentQueue[k].PID){
                                    rows[i].cells[9].innerHTML = _ResidentQueue[k].state;
                                    break;
                              }

                    
               }                  
               }
         

        }

       // Fetch opcode
        public fetch(addIndex){
              var nextByte = _MemoryArray[addIndex];
              return nextByte;

        }
        
        public decode(){

        }

        public execute(opcode){

        }



   }

}
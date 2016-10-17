///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        //Load programInput into memory 
        MemoryManager.prototype.loadProgToMem = function () {
            /*
            Get program input from html and remove all spaces from program input
            put program input into memory if current address is less than programSize
            Increase PID by one, Create a new instance of PCB by one and push cusrrent PCB to Resident queue
            */
            var programInput = _ProgramInput.replace(/[\s]/g, "");
            var j = _CurrMemIndex;
            for (var i = 0; i < programInput.length; i++) {
                if (_CurrMemIndex < _ProgramSize) {
                    _MemoryArray[j] = programInput[i] + programInput[i + 1];
                    j++;
                    i++;
                }
            }
            _CurrMemIndex = j;
            _PID++;
            _Pcb = new TSOS.Pcb();
            _Pcb.pcbProgram = programInput;
            _Pcb.state = PS_Ready;
            _ResidentQueue.push(_Pcb);
            _StdOut.putText("PID " + _PID + " Loaded");
            //Create row and insert into PCB table
            var myTable = document.getElementById("pcbTable");
            var newRow = myTable.insertRow(myTable.rows.length);
            //myTable.insertRow(myTable.rows.length);
            // Insert a cell in the row at index 0
            var newCell1 = newRow.insertCell(0);
            // Append a text node to the cell
            var newText = document.createTextNode(_Pcb.PID + "");
            newCell1.appendChild(newText);
            // Insert a cell in the row at index 1
            var newCell2 = newRow.insertCell(1);
            // Append a text node to the cell
            var newText = document.createTextNode(_Pcb.PC + "");
            newCell2.appendChild(newText);
            // Insert a cell in the row at index 2
            var newCell3 = newRow.insertCell(2);
            // Append a text node to the cell
            var newText = document.createTextNode("Not");
            newCell3.appendChild(newText);
            // Insert a cell in the row at index 4
            var newCell4 = newRow.insertCell(3);
            // Append a text node to the cell
            var newText = document.createTextNode(_Pcb.Acc + "");
            newCell4.appendChild(newText);
            // Insert a cell in the row at index 5
            var newCell5 = newRow.insertCell(4);
            // Append a text node to the cell
            var newText = document.createTextNode(_Pcb.Xreg + "");
            newCell5.appendChild(newText);
            // Insert a cell in the row at index 6
            var newCell6 = newRow.insertCell(5);
            // Append a text node to the cell
            var newText = document.createTextNode(_Pcb.Yreg + "");
            newCell6.appendChild(newText);
            // Insert a cell in the row at index 7
            var newCell7 = newRow.insertCell(6);
            // Append a text node to the cell
            var newText = document.createTextNode(_Pcb.Zflag + "");
            newCell7.appendChild(newText);
            // Insert a cell in the row at index 8
            var newCell8 = newRow.insertCell(7);
            // Append a text node to the cell
            var newText = document.createTextNode(_Pcb.base + "");
            newCell8.appendChild(newText);
            // Insert a cell in the row at index 9
            var newCell9 = newRow.insertCell(8);
            // Append a text node to the cell
            var newText = document.createTextNode(_Pcb.limit + "");
            newCell9.appendChild(newText);
            // Insert a cell in the row at index 10
            var newCell10 = newRow.insertCell(9);
            // Append a text node to the cell
            var newText = document.createTextNode(_Pcb.state + "");
            newCell10.appendChild(newText);
            //alert(myTable.rows.length)
        };
        MemoryManager.prototype.updateMemTable = function () {
            //load program to memory
            this.loadProgToMem();
            //get Memory table and upadte memory cells
            var memoryTable = document.getElementById("memoryTable");
            var rows = memoryTable.getElementsByTagName("tr");
            var memIndex = 0;
            for (var i = 0; i < rows.length; i++) {
                var cells = rows[i].cells;
                for (var j = 1; j < cells.length; j++) {
                    rows[i].cells[j].innerHTML = _MemoryArray[memIndex];
                    memIndex++;
                }
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));

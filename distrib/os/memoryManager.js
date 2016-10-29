///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        //Load programInput into memory 
        MemoryManager.prototype.loadProgToMem = function (programInput) {
            /*
            Get program input from html and remove all spaces from program input
            put program input into memory if current address is less than programSize
            Increase PID by one, Create a new instance of PCB by one and push cusrrent PCB to Resident queue
            */
            programInput = _ProgramInput.replace(/[\s]/g, "");
            var j = _Base;
            for (var i = 0; i < programInput.length; i++) {
                _MemoryArray[j] = programInput[i] + programInput[i + 1];
                j++;
                i++;
            }
            //Increase current memory index by 2 so that new process starts by 2 bytes offset
            //_CurrMemIndex = (_Base - j) + j;
            _PID++;
            _CurrentProgram = new TSOS.Pcb();
            _CurrentProgram.pcbProgram = programInput;
            _CurrentProgram.base = _Base;
            _CurrentProgram.state = PS_New;
            _ResidentQueue.push(_CurrentProgram);
            _StdOut.putText("PID " + _PID + " Loaded");
            //Create row and insert into PCB table
            var myTable = document.getElementById("pcbTable");
            var newRow = myTable.insertRow(myTable.rows.length);
            //myTable.insertRow(myTable.rows.length);
            // Insert a cell in the row at index 0
            var newCell1 = newRow.insertCell(0);
            // Append a text node to the cell
            var newText = document.createTextNode(_CurrentProgram.PID + "");
            newCell1.appendChild(newText);
            // Insert a cell in the row at index 1
            var newCell2 = newRow.insertCell(1);
            // Append a text node to the cell
            var newText = document.createTextNode(_CPU.PC + "");
            newCell2.appendChild(newText);
            // Insert a cell in the row at index 2
            var newCell3 = newRow.insertCell(2);
            // Append a text node to the cell
            var newText = document.createTextNode(_CurrentProgram.IR + "");
            newCell3.appendChild(newText);
            // Insert a cell in the row at index 4
            var newCell4 = newRow.insertCell(3);
            // Append a text node to the cell
            var newText = document.createTextNode(_CurrentProgram.Acc + "");
            newCell4.appendChild(newText);
            // Insert a cell in the row at index 5
            var newCell5 = newRow.insertCell(4);
            // Append a text node to the cell
            var newText = document.createTextNode(_CurrentProgram.Xreg + "");
            newCell5.appendChild(newText);
            // Insert a cell in the row at index 6
            var newCell6 = newRow.insertCell(5);
            // Append a text node to the cell
            var newText = document.createTextNode(_CurrentProgram.Yreg + "");
            newCell6.appendChild(newText);
            // Insert a cell in the row at index 7
            var newCell7 = newRow.insertCell(6);
            // Append a text node to the cell
            var newText = document.createTextNode(_CurrentProgram.Zflag + "");
            newCell7.appendChild(newText);
            // Insert a cell in the row at index 8
            var newCell8 = newRow.insertCell(7);
            // Append a text node to the cell
            var newText = document.createTextNode(_CurrentProgram.base + "");
            newCell8.appendChild(newText);
            // Insert a cell in the row at index 9
            var newCell9 = newRow.insertCell(8);
            // Append a text node to the cell
            var newText = document.createTextNode(_CurrentProgram.limit + "");
            newCell9.appendChild(newText);
            // Insert a cell in the row at index 10
            var newCell10 = newRow.insertCell(9);
            // Append a text node to the cell
            var newText = document.createTextNode(_CurrentProgram.state + "");
            newCell10.appendChild(newText);
            //alert(myTable.rows.length)
            //Ctreate CPU log
            this.cpuTableLog();
            //Get new base
            if (_Base != 512) {
                _Base = _Base + 256;
            }
        };
        MemoryManager.prototype.updateMemTable = function () {
            //load program to memory
            this.loadProgToMem(_ProgramInput);
            //get Memory table and upadte memory cells
            var memoryTable = document.getElementById("memoryTable");
            var rows = memoryTable.getElementsByTagName("tr");
            var prevBase = _Base - 256;
            var startRowIndex = 0;
            if (_MemoryArray[prevBase] != "00") {
                startRowIndex = _RowNumber;
                _RowNumber = _RowNumber + 32;
            }
            //To DO : Error if Base is greater than 512
            var memIndex = prevBase;
            for (var i = startRowIndex; i < _RowNumber; i++) {
                var cells = rows[i].cells;
                for (var j = 1; j < cells.length; j++) {
                    rows[i].cells[j].innerHTML = _MemoryArray[memIndex];
                    memIndex++;
                }
            }
        };
        //Update memory table when memory is erased
        MemoryManager.prototype.clearMemoryLog = function () {
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
        MemoryManager.prototype.cpuTableLog = function () {
            //Create row and insert into CPU table
            var myTable = document.getElementById("cpuTable");
            var newRow = myTable.insertRow(myTable.rows.length);
            if (myTable.rows.length <= 2) {
                // Insert a cell in the row at index 0
                var newCell1 = newRow.insertCell(0);
                // Append a text node to the cell
                var newText = document.createTextNode(_CPU.PC + "");
                newCell1.appendChild(newText);
                // Insert a cell in the row at index 1
                var newCell2 = newRow.insertCell(1);
                // Append a text node to the cell
                var newText = document.createTextNode(_CPU.IR + "");
                newCell2.appendChild(newText);
                // Insert a cell in the row at index 2
                var newCell3 = newRow.insertCell(2);
                // Append a text node to the cell
                var newText = document.createTextNode(_CPU.Acc + "");
                newCell3.appendChild(newText);
                // Insert a cell in the row at index 3
                var newCell4 = newRow.insertCell(3);
                // Append a text node to the cell
                var newText = document.createTextNode(_CPU.Xreg + "");
                newCell4.appendChild(newText);
                // Insert a cell in the row at index 4
                var newCell5 = newRow.insertCell(4);
                // Append a text node to the cell
                var newText = document.createTextNode(_CPU.Yreg + "");
                newCell5.appendChild(newText);
                // Insert a cell in the row at index 5
                var newCell6 = newRow.insertCell(5);
                // Append a text node to the cell
                var newText = document.createTextNode(_CPU.Zflag + "");
                newCell6.appendChild(newText);
            }
        };
        MemoryManager.prototype.updateCpuTable = function () {
            //get Memory table and upadte memory cells
            var cpuTable = document.getElementById("cpuTable");
            var row = cpuTable.getElementsByTagName("tr")[1];
            row.cells[0].innerHTML = _CPU.PC + "";
            row.cells[1].innerHTML = _IR;
            row.cells[2].innerHTML = _CPU.Acc + "";
            row.cells[3].innerHTML = _CPU.Xreg + "";
            row.cells[4].innerHTML = _CPU.Yreg + "";
            row.cells[5].innerHTML = _CPU.Zflag + "";
        };
        MemoryManager.prototype.updatePcbTable = function (pcb) {
            //load program to memory
            //this.loadProgToMem();
            //get Memory table and upadte memory cells
            var pcbTable = document.getElementById("pcbTable");
            var rows = pcbTable.getElementsByTagName("tr");
            for (var i = 1; i < rows.length; i++) {
                var cells = rows[i].cells;
                if (rows[i].cells[0].innerHTML == pcb.PID) {
                    rows[i].cells[0].innerHTML = pcb.PID + "";
                    rows[i].cells[1].innerHTML = _CPU.PC + "";
                    rows[i].cells[2].innerHTML = _IR;
                    rows[i].cells[3].innerHTML = _CPU.Acc + "";
                    rows[i].cells[4].innerHTML = _CPU.Xreg + "";
                    rows[i].cells[5].innerHTML = _CPU.Yreg + "";
                    rows[i].cells[6].innerHTML = _CPU.Zflag + "";
                    rows[i].cells[7].innerHTML = pcb.base + "";
                    rows[i].cells[8].innerHTML = pcb.limit + "";
                    rows[i].cells[9].innerHTML = pcb.state;
                    break;
                }
            }
        };
        MemoryManager.prototype.deleteRowPcb = function (pcb) {
            //load program to memory
            //this.loadProgToMem();
            //get Memory table and upadte memory cells
            var pcbTable = document.getElementById("pcbTable");
            var rows = pcbTable.getElementsByTagName("tr");
            for (var i = 1; i < rows.length; i++) {
                var cells = rows[i].cells;
                if (rows[i].cells[0].innerHTML == pcb.PID) {
                    rows[i].remove();
                    break;
                }
            }
        };
        //Clear a section of memory
        MemoryManager.prototype.resetMem = function () {
            var index = _CurrentProgram.base;
            alert("Index " + index);
            for (var i = 0; i < _ProgramSize; i++) {
                _MemoryArray[index] = "00";
                index++;
            }
        };
        // Fetch opcode
        MemoryManager.prototype.fetch = function (addIndex) {
            var nextByte = _MemoryArray[addIndex];
            return nextByte;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));

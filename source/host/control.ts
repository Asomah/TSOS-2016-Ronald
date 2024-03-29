///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />
///<reference path="../os/deviceDriverFileSystem.ts" />
///<reference path="memory.ts" />
///<reference path="cpu.ts" />


/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.


            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement>document.getElementById("taHostLog")).value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement>document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement>document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        public static memoryTable(): void {
            //Create an array of memory
            _Memory = new Memory();
            _Memory.init();


            //Create table with 9 columns
            var memTable = document.getElementById("memoryTable")

            //Loop through memory array and create a new row if length of current row is 8

            for (var i = 0; i < _MemoryArray.length; i++) {
                if (i % 8 == 0) {
                    var row = document.createElement("tr");
                    document.getElementById("memoryTable").appendChild(row);

                    var cell = document.createElement("td");
                    var hexString = i.toString(16);

                    while (hexString.length < 3) {
                        hexString = "0" + hexString;
                    }

                    var data = document.createTextNode("0x" + hexString.toUpperCase());
                    cell.appendChild(data);
                    row.appendChild(cell);
                }
                var cell = document.createElement("td");
                var data = document.createTextNode(_MemoryArray[i]);
                var rows = document.getElementById("memoryTable").getElementsByTagName("tr");
                var lastRow = rows[rows.length - 1];
                cell.appendChild(data);
                lastRow.appendChild(cell);
            }


        }

        //Create hard disk table
        public static hardDiskTable(): void {
            // make a new instance of DeviceDriverFileSystem
            _DeviceDriverFileSystem = new DeviceDriverFileSystem();

            //get the tag of the hard disk table body
            var hardDiskHTML = document.getElementById("fsBody");
            hardDiskHTML.innerHTML = "";
            var key = "";
            for (var i = 0; i < _DeviceDriverFileSystem.tracks ; i++) {
                for (var j = 0; j < _DeviceDriverFileSystem.sectors; j++) {
                    for (var k = 0; k < _DeviceDriverFileSystem.blocks; k++) {
                        var key = i.toString() + j.toString() + k.toString();
                         var data = _DeviceDriverFileSystem.initializeBlock();

                        //Set MBR inUse bit to 1 so that it never gets accessed
                        if (key == "000"){
                            data = "1000"+ data.substring(_DeviceDriverFileSystem.headerSize); 
                        } 
                        //save data to session storage
                        sessionStorage.setItem(key, data);

                        var row = document.createElement("tr");
                        hardDiskHTML.appendChild(row);

                        var cell = document.createElement("td");
                        cell.className = "tsb";
                        cell.textContent = key;
                        row.appendChild(cell);

                        var cell = document.createElement("td");
                        cell.className = "inUse";
                        cell.textContent = data.substring(0,1);
                        row.appendChild(cell);

                        var cell = document.createElement("td");
                        cell.className = "headerTSB";
                        cell.textContent = data.substring(1, _DeviceDriverFileSystem.headerSize);
                        row.appendChild(cell);

                        var cell = document.createElement("td");
                        cell.className = "data";
                        cell.textContent = data.substring( _DeviceDriverFileSystem.headerSize);
                        row.appendChild(cell);
                    }
                }
            }
        }

        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.


            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.

            this.memoryTable();

            this.hardDiskTable();


        }

        public static hostBtnHaltOS_click(btn): void {

            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnSingleStepOS_click(btn): void {
            if ((<HTMLButtonElement>document.getElementById("singleStep")).value != "Exit") {
                (<HTMLButtonElement>document.getElementById("execStep")).disabled = false;
                //(<HTMLButtonElement>document.getElementById("singleStep")).disabled = true;
                (<HTMLButtonElement>document.getElementById("singleStep")).style.backgroundColor = "red";
                (<HTMLButtonElement>document.getElementById("singleStep")).value = "Exit";
                //(<HTMLButtonElement>document.getElementById("execStep")).style.backgroundColor = "blue";

                 //_CPU.cycle();
                 _CPU.isExecuting = false;
            }
            else{
                (<HTMLButtonElement>document.getElementById("execStep")).disabled = true;
                (<HTMLButtonElement>document.getElementById("singleStep")).value = "Single Step";
                _CPU.isExecuting = true;
                //_CPU.cycle();
            }

        }
        public static hostBtnExecStepOS_click(btn): void {
            if (_CPU.startIndex > 0) {
                if (_MemoryManager.fetch(_CPU.startIndex) != "00") {
                    _CPU.cycle();
                } else {
                    _CPU.cycle();
                    //(<HTMLButtonElement>document.getElementById("singleStep")).disabled = false;
                    (<HTMLButtonElement>document.getElementById("singleStep")).style.backgroundColor = "green";
                    //(<HTMLButtonElement>document.getElementById("execStep")).style.backgroundColor = "red";
                    (<HTMLButtonElement>document.getElementById("execStep")).disabled = true;
                    (<HTMLButtonElement>document.getElementById("singleStep")).value = "Single Step";
                }

            }


        }

    }
}

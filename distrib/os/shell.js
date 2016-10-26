///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Displays the users current location.");
            this.commandList[this.commandList.length] = sc;
            // restart
            sc = new TSOS.ShellCommand(this.shellRestart, "restart", "- Restarts the OS");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBsod, "alpaca", " - Traps an OS Error");
            this.commandList[this.commandList.length] = sc;
            //status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", " <String> - Status of user.");
            this.commandList[this.commandList.length] = sc;
            //load 
            sc = new TSOS.ShellCommand(this.shellLoad, "load", " <HEX> - Validates user code.");
            this.commandList[this.commandList.length] = sc;
            //run
            sc = new TSOS.ShellCommand(this.shellRun, "run", " <pid> - run a valid process.");
            this.commandList[this.commandList.length] = sc;
            //clear All
            sc = new TSOS.ShellCommand(this.shellClearAll, "clearall", "Clears all memory partitions .");
            this.commandList[this.commandList.length] = sc;
            //run All
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "Runs all loaded programs in memory.");
            this.commandList[this.commandList.length] = sc;
            //Quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - sets the quantum for round robin.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Ver displays version of OS.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown turns off the OS while the hardware keeps running.");
                        break;
                    case "cls":
                        _StdOut.putText("Cls Clears the screen and resets the cursor position.");
                        break;
                    case "man":
                        _StdOut.putText("Man Displays the MANual page for a particular topic selected.");
                        break;
                    case "trace":
                        _StdOut.putText("Trace turns the OS trace on or off.");
                        break;
                    case "rot13":
                        _StdOut.putText("Rot13 does rot13 obfuscation on a string.");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt sets the promt.");
                        break;
                    case "date":
                        _StdOut.putText("Date displays the current date and time.");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami displays the current location of user.");
                        break;
                    case "restart":
                        _StdOut.putText("Restarts the OS.");
                        break;
                    case "alpaca":
                        _StdOut.putText("Traps an OS Error.");
                        break;
                    case "status":
                        _StdOut.putText("Displays status of user.");
                        break;
                    case "load":
                        _StdOut.putText("Validates user code.");
                        break;
                    case "run":
                        _StdOut.putText("Runs a valid process.");
                        break;
                    case "clearall":
                        _StdOut.putText("Clears all memory partitions.");
                        break;
                    case "runall":
                        _StdOut.putText("Runs all loaded programs in memory");
                        break;
                    case "quantum":
                        _StdOut.putText("Sets the quantum number for Round Robin");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            var date = new Date().toDateString();
            var time = new Date().toLocaleTimeString();
            _StdOut.putText(date + ' ' + time);
        };
        Shell.prototype.shellWhereAmI = function (args) {
            _StdOut.putText("MARS!!! There is no place for you on earth");
        };
        Shell.prototype.shellRestart = function (args) {
            location.reload(true);
        };
        Shell.prototype.shellBsod = function (args) {
            _Kernel.krnTrapError(args);
        };
        Shell.prototype.shellStatus = function (args) {
            //Display current status
            var statusString = "";
            for (var i = 0; i < args.length; i++) {
                statusString = statusString + args[i] + " ";
            }
            document.getElementById('Status').innerHTML = 'Status: ' + statusString;
        };
        Shell.prototype.shellLoad = function (args) {
            //Get user input fromm html
            _ProgramInput = document.getElementById("taProgramInput").value;
            var hex = _ProgramInput;
            //make new regex and check if user's input matches the regex
            var regex = new RegExp('^[0-9A-Fa-f\\s]+$');
            if (hex.match(regex)) {
                _StdOut.putText('VALID HEX');
                _Console.advanceLine();
                //load Program into Memory
                //Create a new PCB
                //Update Memory Table
                var programInput = _ProgramInput.replace(/[\s]/g, "");
                if ((programInput.length / 2) < 256 && _MemoryArray[_Base] == "00") {
                    _MemoryManager = new TSOS.MemoryManager();
                    _MemoryManager.updateMemTable();
                }
                else {
                    //Error if program is greater than or equal to 256
                    _StdOut.putText("Program too Large.. ");
                }
            }
            else {
                _StdOut.putText('INVALID HEX');
                //reset program input if not valid
                _ProgramInput = "";
            }
        };
        Shell.prototype.shellRun = function (args) {
            /*
            compare arg with all pids in resident Queue
            if arg equals any pid, run that job else display an error message
            */
            //set Runall to false if running a specific program
            _RunAll = false;
            if (args.length == 0) {
                _StdOut.putText('Empty PID... Please enter PID');
            }
            else {
                var pid = -1;
                var index = -1;
                for (index = 0; index < _ResidentQueue.length; index++) {
                    if (args == _ResidentQueue[index].PID) {
                        pid = _ResidentQueue[index].PID;
                        //remove process from resident queue and push it to ready queue
                        _ResidentQueue[index].state = PS_Ready;
                        _CurrentProgram = _ResidentQueue[index];
                        _ResidentQueue.splice(index, 1);
                        //push pcb to ready queue
                        _ReadyQueue.push(_CurrentProgram);
                        //update pcb table
                        _MemoryManager.updatePcbTable(_CurrentProgram);
                        break;
                    }
                }
                if (_CurrentProgram.state != PS_Terminated) {
                    //alert(pid);
                    _StdOut.putText('Running PID ' + pid);
                    if (document.getElementById("singleStep").disabled == true) {
                        _CPU.cycle();
                    }
                    else {
                        _CPU.init();
                        _CPU.isExecuting = true;
                    }
                }
                else {
                    _StdOut.putText('PID ' + pid + ' is terminated... You cannot run this procces ');
                }
            }
        };
        Shell.prototype.shellRunAll = function (args) {
            //run all programs in resident queue if not empty
            _RunAll = true;
            if (_ResidentQueue.length > 0) {
                var resLength = _ResidentQueue.length;
                for (var i = resLength; i > 0; i--) {
                    //remove process from resident queue and push it to ready queue
                    _ResidentQueue[0].state = PS_Ready;
                    _CurrentProgram = _ResidentQueue[0];
                    alert(_CurrentProgram.state);
                    _ResidentQueue.splice(0, 1);
                    //push pcb to ready queue
                    _ReadyQueue.push(_CurrentProgram);
                    //update pcb table
                    _MemoryManager.updatePcbTable(_CurrentProgram);
                }
                alert(_ResidentQueue.length);
                alert(_ReadyQueue.length);
                _CurrentProgram = _ReadyQueue[0];
                if (_CurrentProgram.state != PS_Terminated) {
                    //alert(pid);
                    _StdOut.putText('Running PID ' + _CurrentProgram.PID);
                    if (document.getElementById("singleStep").disabled == true) {
                        _CPU.cycle();
                    }
                    else {
                        _CPU.init();
                        _CPU.isExecuting = true;
                    }
                }
            }
            else {
                _StdOut.putText("No programs loaded... Load program(s) to before using this command");
            }
        };
        Shell.prototype.shellClearAll = function (args) {
            //clear memory and update memory log
            _Base = 0;
            _BaseProgram = 0;
            _RowNumber = 0;
            _Memory.init();
            _MemoryManager.clearMemoryLog();
        };
        Shell.prototype.shellQuantum = function (args) {
            //Sets quantum number for round robin
            if (args == parseInt(args, 10))
                _Quantum = args;
            else
                _StdOut.putText("Please enter an inter");
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));

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

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                "ver",
                "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                "help",
                "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                "shutdown",
                "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                "cls",
                "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                "man",
                "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                "trace",
                "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                "rot13",
                "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                "prompt",
                "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                "whereami",
                "- Displays the users current location.");
            this.commandList[this.commandList.length] = sc;

            // restart
            sc = new ShellCommand(this.shellRestart,
                "restart",
                "- Restarts the OS");
            this.commandList[this.commandList.length] = sc;

            // bsod
            sc = new ShellCommand(this.shellBsod,
                "alpaca",
                " - Traps an OS Error");
            this.commandList[this.commandList.length] = sc;
            //status
            sc = new ShellCommand(this.shellStatus,
                "status",
                " <String> - Status of user.");
            this.commandList[this.commandList.length] = sc;

            //load 
            sc = new ShellCommand(this.shellLoad,
                "load",
                " <HEX> - Validates user code.");
            this.commandList[this.commandList.length] = sc;

            //run
            sc = new ShellCommand(this.shellRun,
                "run",
                " <pid> - run a valid process.");
            this.commandList[this.commandList.length] = sc;

            //clear All
            sc = new ShellCommand(this.shellClearAll,
                "clearall",
                "Clears all memory partitions .");
            this.commandList[this.commandList.length] = sc;

            //run All
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                "Runs all loaded programs in memory.");
            this.commandList[this.commandList.length] = sc;

            //Quantum
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "<int> - sets the quantum for round robin.");
            this.commandList[this.commandList.length] = sc;

            //Active pids
            sc = new ShellCommand(this.shellActivePids,
                "ps",
                "Displays all acive pids.");
            this.commandList[this.commandList.length] = sc;

            //kill a process
            sc = new ShellCommand(this.shellKill,
                "kill",
                "<pid> to kill a specific process.");
            this.commandList[this.commandList.length] = sc;



            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
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
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
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
                    case "ps":
                        _StdOut.putText("Displys all active pids");
                        break;
                    case "kill":
                        _StdOut.putText("Kills a specified process");
                        break;


                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");

            }
        }

        public shellDate(args) {
            var date = new Date().toDateString();
            var time = new Date().toLocaleTimeString();
            _StdOut.putText(date + ' ' + time);

        }
        public shellWhereAmI(args) {
            _StdOut.putText("MARS!!! There is no place for you on earth");

        }

        public shellRestart(args) {
            location.reload(true);
        }

        public shellBsod(args) {
            _Kernel.krnTrapError(args);

        }

        public shellStatus(args) {
            //Display current status
            var statusString = "";
            for (var i = 0; i < args.length; i++) {
                statusString = statusString + args[i] + " ";
            }
            document.getElementById('Status').innerHTML = 'Status: ' + statusString;
        }

        public shellLoad(args) {
            //Get user input fromm html
            _ProgramInput = (<HTMLInputElement>document.getElementById("taProgramInput")).value;
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
                if ((programInput.length / 2) < _ProgramSize) {
                    _MemoryManager = new MemoryManager();
                    _MemoryManager.updateMemTable();
                } else {
                    //Error if program is greater than or equal to 256
                    _StdOut.putText("Program too Large.. ");
                }

            } else {
                _StdOut.putText('INVALID HEX');
                //reset program input if not valid
                _ProgramInput = "";

            }

        }

        public shellRun(args) {
            /*
            compare arg with all pids in resident Queue
            if arg equals any pid, run that job else display an error message
            */

            //set Runall to false if running a specific program

            _DONE = false;
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
                    //base to start running program
                    _CPU.startIndex = _CurrentProgram.base;
                    _StdOut.putText('Running PID ' + pid);
                    if ((<HTMLButtonElement>document.getElementById("singleStep")).disabled == true) {
                        _CPU.cycle();
                    }
                    else {
                        _CPU.init();
                        _CPU.isExecuting = true;
                    }
                    //_ResidentQueue[index].state = PS_Running;
                    // _CPU.counter = _ResidentQueue[index].startIndex;
                    //_CPU.isExecuting = false;
                    //_ResidentQueue[index].state = PS_Terminated;
                    //_MemoryManager.updatePcbTable();

                }
                else {
                    _StdOut.putText('PID ' + pid + ' is terminated... You cannot run this procces ');
                }

            }
        }

        public shellRunAll(args) {
            //run all programs in resident queue if not empty
            _RunAll = true;
            _DONE = false;
            _ClockTicks = 0;

            if (_ResidentQueue.length > 0) {
                var resLength = _ResidentQueue.length;
                for (var i = resLength; i > 0; i--) {
                    //remove process from resident queue and push it to ready queue
                    _ResidentQueue[0].state = PS_Ready;
                    _CurrentProgram = _ResidentQueue[0];
                    _ResidentQueue.splice(0, 1);

                    //push pcb to ready queue
                    _ReadyQueue.push(_CurrentProgram);

                    //update pcb table
                    _MemoryManager.updatePcbTable(_CurrentProgram);

                }

                _CurrentProgram = _ReadyQueue[0];
                _CPU.startIndex = _CurrentProgram.base;

                if (_CurrentProgram.state != PS_Terminated) {
                    //alert(pid);
                    _StdOut.putText('Running all Programs ... ');
                    if ((<HTMLButtonElement>document.getElementById("singleStep")).disabled == true) {
                        _ClockTicks++;
                        _CPU.cycle();

                    }
                    else {
                        _CPU.init();
                        _ClockTicks++;
                        _CPU.isExecuting = true;
                    }

                }
            } else {
                _StdOut.putText("No programs loaded... Load program(s) to before using this command");
            }



        }


        public shellClearAll(args) {
            //clear memory and update memory log
            _Base = 0;
            _BaseProgram = 0;
            _ResidentQueue = [];
            _ReadyQueue = [];
            _RowNumber = 0;
            _Memory.init();
            _MemoryManager.clearMemoryLog();


        }

        public shellQuantum(args) {
            //Sets quantum number for round robin

            if (args == parseInt(args, 10))
                _Quantum = args;
            else
                _StdOut.putText("Please enter an inter");
        }

        public shellActivePids(args) {
            if (_ReadyQueue.length != 0) {
                alert("ReadyQueue " + _ReadyQueue.length)
                for (var i = 0; i < _ReadyQueue.length; i++) {
                    _StdOut.putText("Active PID :: " + _ReadyQueue[i].PID);
                    _StdOut.advanceLine();
                }
            }
            else {
                _StdOut.putText("There are no active pids");
            }

        }

        public shellKill(args) {
            _CPU.isExecuting = false;
            var deadProg = new Pcb();
            var pid = -1;
            if (args.length == 0) {
                _StdOut.putText('Empty PID... Please enter PID');
            }
            else {
                if (_ReadyQueue.length == 0) {
                    _StdOut.putText('There are no active PIDs to Kill');
                }
                else {
                    for (var i = 0; i < _ReadyQueue.length; i++) {
                        if (args == _ReadyQueue[i].PID) {
                            pid = _ReadyQueue[i].PID;


                            //remove process from ready queue
                            if (_ReadyQueue.length > 1) {
                                deadProg = _ReadyQueue[i];
                                deadProg.state = PS_Terminated;

                                if (i == _ReadyQueue.length - 1) {
                                    _CurrentProgram = _ReadyQueue[0];
                                }
                                else {
                                    _CurrentProgram = _ReadyQueue[i + 1];
                                }

                                _ReadyQueue.splice(i, 1);
                                _CPU.isExecuting = true;
                                _CPU.cycle();

                            }
                            else {
                                deadProg = _ReadyQueue[i];
                                deadProg.state = PS_Terminated;
                                _ReadyQueue.splice(i, 1);

                            }

                            //_CPU.isExecuting = false;

                            //update pcb table
                            _MemoryManager.deleteRowPcb(deadProg);
                            break;
                        }

                    }
                }

                if (pid == (-1)) {
                    _StdOut.putText('INVALID PID ... The pid you entered is not active to be killed');
                }


            }

        }

    }
}

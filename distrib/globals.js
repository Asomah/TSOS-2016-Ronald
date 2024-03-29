/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
var APP_NAME = "RD-OS"; // 'cause Bob and I were at a loss for a better name.
var APP_VERSION = "1.04"; // What did you expect?
var CPU_CLOCK_INTERVAL = 50; // This is in ms (milliseconds) so 1000 = 1 second.
var TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var SYSCALL_IRQ = 2;
var BREAK_IRQ = 3;
var INVALIDOPCODE_IRQ = 4;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _ArrayOfCommands = [];
var _ArrayOfHistory = [];
//var _CurrentProcess = new Pcb();
var _ProgramSize = 256; //Allocate 256 bytes for program
var _MemorySize = _ProgramSize * 3; // Memory size 
var _MemoryArray = [];
var _PID = -1; //PID for PCB
var _IR = "NA";
var _Acc = 0;
var _PC = 0;
var _Xreg = 0;
var _Yreg = 0;
var _Zflag = 0;
var _DONE = false;
// states of process for PCB.. Make constants to represent different states.
var PS_New = "New";
var PS_Ready = "Ready";
var PS_Running = "Running";
var PS_Terminated = "Terminated";
var _Priority = 120;
var _Quantum = 6; //default quantum number
var _ClockTicks = 0; //number of clock ticks 
var _WaitTime = 1; //Global to Initialize wait timer
var _TaTime = 1; //Global to Initialize turn around time 
var _RunAll = false; //booleann to check if we are running more than one program
var _RunOne = false; // running just one program
var _RunHDProgram;
var _ResetMem = false;
var _RowNumber = 0; //row number for each program
var _CurrMemIndex = 0;
//var _Base: number = 0;                  //defualt base of memory
var _ResidentQueue = []; //resident queue 
var _ReadyQueue = []; //ready queue 
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
var _CurrentProgram;
var _Memory;
var _MemoryManager;
var _CpuScheduler;
var _DeviceDriverFileSystem;
var _ProgramInput = ""; //Program input
var _CpuSchedule = "rr"; // default cpu scheduling to round robbin
var _IsProgramName = false; // boolean to check if fileName is a name of a process on the ready queue 
//var _Format = true;          //boolean to check if format command should be executed or not 
var _FormatCommandActive = false; // boolean to check if format command is enterred or not
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue; // Initializing this to null (which I would normally do) would then require us to specify the 'any' type, as below.
var _KernelInputQueue = null; // Is this better? I don't like uninitialized variables. But I also don't like using the type specifier 'any'
var _KernelBuffers = null; // when clearly 'any' is not what we want. There is likely a better way, but what is it?
// Standard input and output
var _StdIn; // Same "to null or not to null" issue as above.
var _StdOut;
// UI
var _Console;
var _OsShell;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver; //  = null;
var _hardwareClockID = null;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};

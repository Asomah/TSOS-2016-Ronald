///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
///<reference path="queue.ts" />
///<reference path="kernel.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];

            /**
             * Check to see if length of params is 2
             * If lenght is not 2, call the krnTrapError to clear the screen and display BSOD
             */
             var errorMsg = "ALPACA NOT THE PASSWORD";
             if ((params.length != 2)){
                 _Kernel.krnTrapError(errorMsg);
             }
             else{
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            var length = _KernelInputQueue.getSize();
            var tempQueue = new Queue;
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
               } 
               else if ((keyCode == 38)                     ||   // Up Arraow
                        (keyCode == 40)) {                       // Down Arrow)
                        chr = String.fromCharCode(keyCode + 500);
                        _KernelInputQueue.enqueue(chr);

                        }
               else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 13)                     ||   // Enter
                        (keyCode == 08)                     ||   // backspace
                        (keyCode == 09))                         // Tab
                         {                       
            
                  //enqueue ! @ # $ % ^ & * ( )
                  if (((keyCode == 49) || (keyCode == 51) || (keyCode == 52) || (keyCode == 53)) && isShifted){
                      keyCode = keyCode - 16;
                  }
                  else if(((keyCode == 55) || (keyCode == 57)) && isShifted){
                      keyCode = keyCode - 17;
                  } 
                  else if((keyCode == 50) && isShifted){
                      keyCode = keyCode + 14 ;
                  } 
                  else if((keyCode == 54) && isShifted){
                      keyCode = keyCode + 40 ;
                  }
                  else if((keyCode == 56) && isShifted){
                      keyCode = keyCode - 14 ;
                  }
                  else if((keyCode == 48) && isShifted){
                      keyCode = keyCode -7 ;
                  }

                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);

            }
            else if ((keyCode >= 188) && (keyCode <= 191) ){  //  , . / > < _ - 
                if (keyCode == 189 && isShifted){
                      keyCode = keyCode - 94;
                 }
                 else if (isShifted){
                     keyCode = keyCode -128;
                 }else{
                     keyCode = keyCode - 144;
                 }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }

             else if ((keyCode >= 219) && (keyCode <= 221) ){  // ] [ \ { } | 
                 if (isShifted){
                     keyCode = keyCode -96;
                 }else{
                     keyCode = keyCode - 128;
                 }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }

            else if ((keyCode == 222)){   // ' "
                if (isShifted){
                     keyCode = keyCode - 188;
                 }else{
                     keyCode = keyCode - 183;
                 }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
           else if ((keyCode == 187)){   // = + 
                if (isShifted){
                     keyCode = keyCode - 144;
                 }else{
                     keyCode = keyCode - 126;
                 }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 192)){   // ` ~
                if (isShifted){
                     keyCode = keyCode - 66;
                 }else{
                     keyCode = keyCode - 96;
                 }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
             else if ((keyCode == 186)){   // ; :
                if (isShifted){
                     keyCode = keyCode - 128;
                 }else{
                     keyCode = keyCode - 127;
                 }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }

        }
    }
  }
}

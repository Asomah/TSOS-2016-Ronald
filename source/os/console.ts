///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
            public currentFontSize = _DefaultFontSize,
            public currentXPosition = 0,
            public indexCmd = -1,
            public currentYPosition = _DefaultFontSize,
            public buffer = "",
            public history = _ArrayOfHistory,
            public prevYPosition = 0,
            public prevXposition = 0,
            public arrayOfCommands = _ArrayOfCommands = ["ver", "help", "shutdown", "cls", "man", "trace", "rot13",
                "prompt", "date", "whereami", "restart", "alpaca", "load"]
        ) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private clearLine(): void {
            _DrawingContext.clearRect(0, this.currentYPosition - this.currentFontSize - 2, _Canvas.width, this.currentFontSize + 7);
            this.currentXPosition = 0;
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key


                    //Display current status
                    document.getElementById('Status').innerHTML = 'Status: ' + this.buffer;

                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    //Add buffer to array of history of commands
                    this.history.push(this.buffer);
                    //Increase index of command history
                    this.indexCmd = this.indexCmd + 1;
                    // ... and reset our buffer.
                    this.buffer = "";



                }
                else if (chr === String.fromCharCode(8)) { //     Backspace key
                    this.backSpace();
                }
                else if (chr === String.fromCharCode(9)) { //     Tab key
                    this.tab();
                }
                else if (chr === String.fromCharCode(538)) { //     Up Arrow key
                    this.upArrow();
                }
                else if (chr === String.fromCharCode(540)) { //     Down Arrow key
                    this.downArrow();
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {

                //Line Wrap advance line if current X position is greater than canvas width
                if (this.currentXPosition >= _Canvas.width - 10) {
                    this.advanceLine();
                }

                // Check the length of text
                if (text.length == 1) {
                    //draw the single text if length is one
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    // Move the current X position.
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                    this.currentXPosition = this.currentXPosition + offset;
                }
                else if (text.length > 1) {
                    /**
                     * if length is greater than one, loop through each character in text
                     * call the putText function to draw each character at a time. 
                     */
                    for (var i = 0; i < text.length; i++) {
                        this.putText(text[i]);
                    }
                }
            }


        }

        /* Another way of implementing backspace which clears the whole line and draws the buffer again
           public deleteText(): void {

            // Make a new buffer, split current buffer into substrings and put them into a temporary buffer. 
            var newBuffer = "";
            var tempBuffer = this.buffer.split('');

            //copy temporary buffer to new buffer but not the last string in tempoary buffer
            for (var i = 0; i < tempBuffer.length - 1; i++) {
                newBuffer = newBuffer + tempBuffer[i];
            }
            this.buffer = newBuffer;

            //Clear the rectangular part of the canvas and draw the text from the new buffer onto the canvas
            this.clearLine();
            this.putText(">" + this.buffer);

        }*/

        public backSpace(): void {
            //Get last character in buffer
            //get new x position and move the cursor to the new x position
            var char = this.buffer.slice(-1);
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
            this.currentXPosition = this.currentXPosition - offset;

            //Delete last character in buffer
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize - 2, _Canvas.width
                , this.currentFontSize + 7);

            //If cursor is on an advanced line, check to see if current x position is less than 1
            //Move back to previous line and reset the x and y positions
            if (this.currentXPosition < 1) {
                this.currentXPosition = this.prevXposition;
                this.currentYPosition = this.prevYPosition;
            }

            // Make a new buffer, split current buffer into substrings and put them into a temporary buffer. 
            var newBuffer = "";
            var tempBuffer = this.buffer.split('');

            //copy temporary buffer to new buffer but not the last string in tempoary buffer
            for (var i = 0; i < tempBuffer.length - 1; i++) {
                newBuffer = newBuffer + tempBuffer[i];
            }
            this.buffer = newBuffer;

        }

        public tab(): void {

            /*
            Sort array of valid commands
            Compare buffer to the start string of the valid commands
            if there is a match, stop the loop and set buffer to the specific valid command
            draw buffer on canvas
            */

            var newArray = _ArrayOfCommands.sort();
            var text = this.buffer;

            for (var i = 0; i < newArray.length; i++) {
                if (newArray[i].indexOf(text) == 0) {
                    this.buffer = newArray[i];
                    break;
                }

            }

            this.clearLine();
            this.putText(">" + this.buffer);

        }

        public upArrow(): void {
            /*Check to see if index of command history is not less than 0
              Set buffer to command by using the index of that command in the commandHistory array
              Clear line and put buffer back
              Decrease index of command history by one if it is greater than 0
            */

            if (this.indexCmd >= 0) {
                this.buffer = this.history[this.indexCmd];

                this.clearLine();
                this.putText(">" + this.buffer);
                if (this.indexCmd > 0) {
                    this.indexCmd = this.indexCmd - 1;
                }
            }
        }
        public downArrow(): void {
            /*Check to see if index of command history is in the right range
               Set buffer to command by using the index of that command in the commandHistory array
               Clear line and put buffer back
               Increase index of command history by one if it is less than the lenght of array -1. 
             */

            if (this.indexCmd < this.history.length && this.history.length != 0) {
                this.buffer = this.history[this.indexCmd];
                this.clearLine();
                this.putText(">" + this.buffer);
                if (this.indexCmd < this.history.length - 1) {
                    this.indexCmd = this.indexCmd + 1;
                }

            }

        }


        public scroll(): void {
            /*Make a new canvas if the current y position is greater than the canvas height
             Clear the screen and paste the new canvas into the old one
             Move the cursor to the bottum of the canvas

            */
            if (this.currentYPosition > _Canvas.height) {
                var newCanvas = _DrawingContext.getImageData(0, _DefaultFontSize + 8, _Canvas.width, _Canvas.height);
                this.clearScreen();
                _DrawingContext.putImageData(newCanvas, 0, 0);
                this.currentYPosition = _Canvas.height - _DefaultFontSize;
            }

        }

        public advanceLine(): void {
            //keep track of the last/highest x position before advancing to new line
            this.prevXposition = this.currentXPosition;
            //keep track of the last y position before advancing to new line
            this.prevYPosition = this.currentYPosition;

            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */

            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;

            // TODO: Handle scrolling. (iProject 1)
            this.scroll();
        }
    }
}

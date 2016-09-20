///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, indexCmd, currentYPosition, buffer, history, arrayOfCommands) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (indexCmd === void 0) { indexCmd = -1; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (history === void 0) { history = _ArrayOfHistory; }
            if (arrayOfCommands === void 0) { arrayOfCommands = _ArrayOfCommands = ["ver", "help", "shutdown", "cls", "man", "trace", "rot13",
                "prompt", "date", "whereami", "restart", "alpaca", "load"]; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.indexCmd = indexCmd;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.history = history;
            this.arrayOfCommands = arrayOfCommands;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.clearLine = function () {
            _DrawingContext.clearRect(0, this.currentYPosition - this.currentFontSize - 2, _Canvas.width, this.currentFontSize + 7);
            this.currentXPosition = 0;
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
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
                else if (chr === String.fromCharCode(8)) {
                    this.deleteText();
                }
                else if (chr === String.fromCharCode(9)) {
                    this.tab();
                }
                else if (chr === String.fromCharCode(538)) {
                    this.upArrow();
                }
                else if (chr === String.fromCharCode(540)) {
                    this.downArrow();
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                //move cursor to the next line if canvas is greater than 480
                if (this.currentXPosition > 480) {
                    this.advanceLine();
                }
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
            //Line Wrap advance line if current X position is greater than canvas width
        };
        Console.prototype.deleteText = function () {
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
        };
        Console.prototype.tab = function () {
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
        };
        Console.prototype.upArrow = function () {
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
        };
        Console.prototype.downArrow = function () {
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
        };
        Console.prototype.scroll = function () {
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
        };
        Console.prototype.advanceLine = function () {
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
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));

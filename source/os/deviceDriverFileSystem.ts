///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverFileSystem.ts
   Requires deviceDriver.ts
   The Kernel File System Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverFileSystem extends DeviceDriver {
        constructor(
            public tracks: number = 4,
            public sectors: number = 8,
            public blocks: number = 8,
            public blockSize: number = 64,
            public dataSize: number = 60,
            public headerSize: number = 4) {
            
            super();
        }





        // Initalize blocks with " - " and " 0 "
        public initializeBlock() {
            var data = "0";
            //initialize tsb with -
            for (var i = 1; i < this.headerSize; i++) {
                data += "-";
            }

            //intitialize data with 0s
             for (var i = 4; i < this.dataSize; i++) {
                data += "0";
            }
            return data;
        }

        //converts the string-data provided to hex
        public convertToHex(data) {
            var hexString = "";

            //converts a char at an index to hex and builds the string
            for (var i = 0; i < data.length; i++) {
                hexString += data.charCodeAt(i).toString(16);
            }

            /* 
            TO DO:: Decide to reset the rest of blocks to 0s
            for (var j = hexString.length; j < this.dataSize; j++) {
                hexString += "0";
            }*/
            return hexString;
        }
        

        
    }
}
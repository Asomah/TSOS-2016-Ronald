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


            //TO DO:: Decide to set the rest of bytes in to 0s or not
            for (var j = hexString.length; j < this.dataSize; j++) {
                hexString += "0";
            }
            return hexString;
        }

        // Write data to a specific TSB key 
        public writeData(key, data): void {
            var hexString = data.substring(0, this.headerSize);

            var newData = data.substring(this.headerSize);

            //check to see if header tsb is free, convert newdata to hex if not free
            if (data.substring(1, this.headerSize) != "---"){
                hexString += this.convertToHex(newData);
            }
            else{
                hexString += newData;
            }

            sessionStorage.setItem(key, hexString);

        }

        //create file
        public createFile(fileName) {

            var dirKey = this.getFreeDirEntry();
            var dataKey = this.getFreeDataEntry();
            var dirData = "";
            var dataData = "";

            // if filename 
            if (fileName.length > this.dataSize) {
                _StdOut.putText("FAILURE");
                _StdOut.advanceLine();
                _StdOut.putText("File name too long... Please enter a file name less than 60 characters.");
            }
            else if (dirKey == "null" || dataKey == null) {
                _StdOut.putText("FAILURE");
                _StdOut.advanceLine();
                _StdOut.putText("Memory out of space... There is no free space to create this file");

            }
            else {
                //Create file if it passes the above cases
                dirData = sessionStorage.getItem(dirKey);
                //set inUse bit for directory block to 1 and set header tsb to the available dataKey
                //set data in dirBlock to the file name enterred then write to data
                dirData = "1" + dataKey + fileName;
                this.writeData(dirKey, dirData);


                //set inUse bit for file/data block to 1 and 
                dataData = sessionStorage.getItem(dataKey);
                dataData = "1" + dataData.substr(1);
                this.writeData(dataKey, dataData);

                this.updateHardDiskTable(dirKey);
                this.updateHardDiskTable(dataKey);

                //Display suscces status
                 _StdOut.putText("SUCESS : " + fileName + " has been created" );

            }

        }

        //get availble dir that is not in use
        public getFreeDirEntry() {
            var key = "";
            var data = "";
            var inUseBit = "";

            for (var i = 0; i < this.sectors; i++) {
                for (var j = 1; j < this.blocks; j++) {
                    key = "0" + i + j;
                    data = sessionStorage.getItem(key);
                    inUseBit = data.substring(0, 1);

                    if (inUseBit == "0") {
                        return key;
                    }

                }
            }
            //return null if there are no available or free tsb
            return "null";
        }

        //get available data that is not in use
        public getFreeDataEntry() {
            var key = "";
            var data = "";
            var inUseBit = "";

            for (var i = 1; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        key = i.toString() + j.toString() + k.toString();
                        data = sessionStorage.getItem(key);
                        inUseBit = data.substring(0, 1);

                        if (inUseBit == "0") {
                            return key;
                        }


                    }
                }
            }

            //return null if there are no available or free tsb
            return "null";

        }

        // 
        public findFilename(filename) {
            var key = "";
            var data = "";
            var fileNameHex = this.convertToHex(filename);

            for (var i = 0; i < this.sectors; i++) {
                for (var j = 0; j < this.blocks; j++) {
                    key = "0" + i + j;
                    data = sessionStorage.getItem(key).substring(this.headerSize);

                    // Keep iterating through the directory entry until
                    // we find a filename match in the file system
                    if (data == fileNameHex) {
                        return key;
                    }
                }
            }

            return null;
        }

        public updateHardDiskTable(key): void {

            //get hard disk table and upadate values
            var hardDiskTable: HTMLTableElement = <HTMLTableElement>document.getElementById("hardDiskTable");
            var rows = hardDiskTable.getElementsByTagName("tr");

            for (var i = 1; i < rows.length; i++) {

                var cells = rows[i].cells;
                // get data block if key is found and update table
                if (rows[i].cells[0].innerHTML == key) {
                    var data = sessionStorage.getItem(key);
                    rows[i].cells[1].innerHTML = data.substring(0, 1);
                    rows[i].cells[2].innerHTML = data.substring(1, this.headerSize);
                    rows[i].cells[3].innerHTML = data.substring(this.headerSize);

                    break;
                }
            }


        }




    }
}
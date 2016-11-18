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
            this.driverEntry = this.krnFsDriverEntry;
        }

        public krnFsDriverEntry() {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "File System Driver loaded";
            // More?
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

        //converts a hex dtring back to regular string
        public fromHexToString(data) {
            var str = "";

            for (var i = 0; i < data.length; i += 2){
                if((data[i] + data[i+1]) != "00")
                 str += String.fromCharCode(parseInt(data.substr(i, 2), 16));
            }
            return str;
           
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
            if (data.substring(1, this.headerSize) != "---" || key[0] != "0") {
                hexString += this.convertToHex(newData);
            }
            else {
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
            else if (dirKey == null || dataKey == null) {
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
                _StdOut.putText("SUCESS : " + fileName + " has been created");

            }

        }

        public writeToFile(fileName, contents) {
            var dirKey = this.findFilename(fileName);
            if (dirKey == null) {
                _StdOut.putText("FAILURE");
                _StdOut.advanceLine();
                _StdOut.putText("File name does not exist");

            }
            else {
                var dirData = sessionStorage.getItem(dirKey);
                var dataKey = dirData.substring(1, this.headerSize);

                var dataData = "";
                var inUseBit = sessionStorage.getItem(dataKey).substring(0, 1);
                var headerTSB = sessionStorage.getItem(dataKey).substring(1, this.headerSize);

                //write to file if length of data is less than 60 bytes
                //NOTE: by converting to hex, each character is 2 bytes
                if (contents.length <= this.dataSize / 2 && inUseBit == "1" && headerTSB == "---") {
                    if (headerTSB == "---"){
                    dataData = inUseBit + headerTSB + contents;
                    this.writeData(dataKey, dataData);
                    this.updateHardDiskTable(dataKey);
                    }
                    else{
                        //get readerble data from hard disk and append the the new contents to it

                    }

                }
                else if (contents.length > this.dataSize / 2 && inUseBit == "1" && headerTSB == "---") {
                    //first data to write to file 
                    var newDataKey = this.getFreeDataEntry();
                    headerTSB = newDataKey;

                    if (newDataKey != null) {
                        var contentSize = 0;
                        var nextContentSize = this.dataSize / 2;
                        while (contentSize < contents.length) {

                            inUseBit = "1";
                            dataData = inUseBit + headerTSB + contents.substring(contentSize, nextContentSize);

                            this.writeData(dataKey, dataData);
                            this.updateHardDiskTable(dataKey);

                            contentSize = + this.dataSize / 2;
                            if ((contents.length - contentSize) <= (this.dataSize / 2)) {
                                nextContentSize = contents.length;
                                headerTSB = "---";

                            }
                            else {
                                nextContentSize = contentSize + this.dataSize / 2;
                                newDataKey = this.getFreeDataEntry();
                                headerTSB = newDataKey;

                                if (newDataKey == null) {
                                     //TO DO:: Error if file is too large

                                     break;

                                }

                            }

                        }
                    }

                }
                else {
                    //TO DO:: Error if file is too large

                }

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
            return null;
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
            return null;

        }

        // 
        public findFilename(fileName) {
            var key = "";
            var data = "";
            var inUseBit = "";
            var fileNameHex = this.convertToHex(fileName);

            for (var i = 0; i < this.sectors; i++) {
                for (var j = 0; j < this.blocks; j++) {
                    key = "0" + i + j;
                    data = sessionStorage.getItem(key).substring(this.headerSize);
                    inUseBit = sessionStorage.getItem(key).substring(0, 1);

                    //alert("Hex File = " + fileNameHex + "  data= " + data);
                    // return key if data of that key is equal to the converted hexString of file name and file name is in use
                    if (data == fileNameHex && inUseBit == "1") {
                       // alert("FileName Found");
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
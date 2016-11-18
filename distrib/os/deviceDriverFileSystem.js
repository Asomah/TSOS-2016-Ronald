///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* ----------------------------------
   DeviceDriverFileSystem.ts
   Requires deviceDriver.ts
   The Kernel File System Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem(tracks, sectors, blocks, dataSize, headerSize) {
            if (tracks === void 0) { tracks = 4; }
            if (sectors === void 0) { sectors = 8; }
            if (blocks === void 0) { blocks = 8; }
            if (dataSize === void 0) { dataSize = 60; }
            if (headerSize === void 0) { headerSize = 4; }
            _super.call(this);
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.dataSize = dataSize;
            this.headerSize = headerSize;
            this.driverEntry = this.krnFsDriverEntry;
        }
        DeviceDriverFileSystem.prototype.krnFsDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "File System Driver loaded";
            // More?
        };
        // Initalize blocks with " - " and " 0 "
        DeviceDriverFileSystem.prototype.initializeBlock = function () {
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
        };
        //converts the string-data provided to hex
        DeviceDriverFileSystem.prototype.convertToHex = function (data) {
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
        };
        // Write data to a specific TSB key 
        DeviceDriverFileSystem.prototype.writeData = function (key, data) {
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
        };
        //create file
        DeviceDriverFileSystem.prototype.createFile = function (fileName) {
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
        };
        DeviceDriverFileSystem.prototype.writeToFile = function (fileName, contents) {
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
                    dataData = inUseBit + headerTSB + contents;
                    this.writeData(dataKey, dataData);
                    this.updateHardDiskTable(dataKey);
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
                            contentSize = +this.dataSize / 2;
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
                }
            }
        };
        //get availble dir that is not in use
        DeviceDriverFileSystem.prototype.getFreeDirEntry = function () {
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
        };
        //get available data that is not in use
        DeviceDriverFileSystem.prototype.getFreeDataEntry = function () {
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
        };
        // 
        DeviceDriverFileSystem.prototype.findFilename = function (fileName) {
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
        };
        DeviceDriverFileSystem.prototype.updateHardDiskTable = function (key) {
            //get hard disk table and upadate values
            var hardDiskTable = document.getElementById("hardDiskTable");
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
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));

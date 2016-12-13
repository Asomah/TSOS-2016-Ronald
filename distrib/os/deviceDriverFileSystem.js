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
        function DeviceDriverFileSystem(tracks, sectors, blocks, dataSize, headerSize, formatCount // Display format waiting message once
            ) {
            if (tracks === void 0) { tracks = 4; }
            if (sectors === void 0) { sectors = 8; }
            if (blocks === void 0) { blocks = 8; }
            if (dataSize === void 0) { dataSize = 60; }
            if (headerSize === void 0) { headerSize = 4; }
            if (formatCount === void 0) { formatCount = 1; }
            _super.call(this);
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.dataSize = dataSize;
            this.headerSize = headerSize;
            this.formatCount = formatCount;
            this.driverEntry = this.krnFsDriverEntry;
        }
        DeviceDriverFileSystem.prototype.krnFsDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "File System Driver loaded";
        };
        // Initalize blocks with " - " and " 0 "
        DeviceDriverFileSystem.prototype.initializeBlock = function () {
            var data = "0";
            //initialize tsb with -
            for (var i = 1; i < this.headerSize; i++) {
                data += "-";
            }
            //intitialize data with 0s
            for (var i = 0; i < this.dataSize * 2; i++) {
                data += "0";
            }
            return data;
        };
        //list all files available on HD
        DeviceDriverFileSystem.prototype.listFiles = function () {
            for (var i = 0; i < this.sectors; i++) {
                for (var j = 1; j < this.blocks; j++) {
                    var key = "0" + i + j;
                    var inUseBit = sessionStorage.getItem(key).substring(0, 1);
                    if (inUseBit == "1") {
                        var data = sessionStorage.getItem(key).substring(this.headerSize);
                        var fileName = this.convertToString(data);
                        //Display file name 
                        _StdOut.putText(fileName);
                        _StdOut.advanceLine();
                    }
                }
            }
        };
        // reinitialize HD
        DeviceDriverFileSystem.prototype.format = function () {
            //look to see if there is a program in the ready queue that is on the HD. Do not execute format command if there is one
            var format = true; //boolean to check if format command should be executed or not
            if (_ReadyQueue.length > 1) {
                for (var i = 0; i < _ReadyQueue.length; i++) {
                    if (_ReadyQueue[i].location == "Hard Disk") {
                        //alert ("Location " + _ReadyQueue[i].location);
                        format = false;
                        if (this.formatCount == 1) {
                            _StdOut.putText("FORMAT WAITING...");
                            _StdOut.advanceLine();
                            this.formatCount++;
                        }
                        break;
                    }
                }
            }
            else if (_ResidentQueue.length > 1) {
                for (var i = 0; i < _ResidentQueue.length; i++) {
                    if (_ResidentQueue[i].location == "Hard Disk") {
                        //alert ("Location " + _ResidentQueue[i].location);
                        format = false;
                        _StdOut.putText("Cannot format HD now... There are programs on HD waiting to be executed.");
                        //set format command back to not activated
                        _FormatCommandActive = false;
                        break;
                    }
                }
            }
            //alert ("Format " + format);
            if (format == true) {
                for (var i = 0; i < this.tracks; i++) {
                    for (var j = 0; j < this.sectors; j++) {
                        for (var k = 0; k < this.blocks; k++) {
                            var key = i.toString() + j.toString() + k.toString();
                            var data = this.initializeBlock();
                            //Set MBR inUse bit to 1 so that it never gets accessed
                            if (key == "000") {
                                data = "1000" + data.substring(this.headerSize);
                            }
                            sessionStorage.setItem(key, data);
                            this.updateHardDiskTable(key);
                        }
                    }
                }
                //Display suscces status
                if (_CPU.isExecuting == true) {
                    _StdOut.advanceLine();
                }
                _StdOut.putText("Successfully Formatted");
                if (_CPU.isExecuting == true) {
                    _StdOut.advanceLine();
                }
                //set format command back to not activated
                _FormatCommandActive = false;
            }
        };
        //converts a hex string back to regular string
        DeviceDriverFileSystem.prototype.convertToString = function (data) {
            var str = "";
            for (var i = 0; i < data.length; i += 2) {
                if ((data[i] + data[i + 1]) == "00") {
                    return str;
                }
                else {
                    str += String.fromCharCode(parseInt(data.substr(i, 2), 16));
                }
            }
            return str;
        };
        //converts the string-data provided to hex
        DeviceDriverFileSystem.prototype.convertToHex = function (data) {
            var hexString = "";
            data += "";
            //converts a char at an index to hex and builds the string
            for (var i = 0; i < data.length; i++) {
                hexString += data.charCodeAt(i).toString(16);
            }
            //TO DO:: Decide to set the rest of bytes in to 0s or not
            for (var j = hexString.length; j < this.dataSize * 2; j++) {
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
            else if (this.findFilename(fileName) != null) {
                //if file already exist don't create it. 
                _StdOut.putText("FAILURE");
                _StdOut.advanceLine();
                _StdOut.putText("File already exist... Create file using a different file name");
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
                //this.writeData(dataKey, dataData);
                sessionStorage.setItem(dataKey, dataData);
                this.updateHardDiskTable(dirKey);
                this.updateHardDiskTable(dataKey);
                if (!_IsProgramName) {
                    //Display suscces status
                    _StdOut.putText("SUCCESS : " + fileName + " has been created");
                }
            }
        };
        //delete a given file 
        DeviceDriverFileSystem.prototype.deleteFile = function (fileName) {
            //check to see if file exists. delete file if it exist else display error.
            var dirKey = this.findFilename(fileName);
            if (dirKey == null) {
                _StdOut.putText("FAILURE");
                _StdOut.advanceLine();
                _StdOut.putText("File name does not exist");
            }
            else {
                var dirData = sessionStorage.getItem(dirKey);
                var dataKey = dirData.substring(1, this.headerSize);
                //reset directory data 
                sessionStorage.setItem(dirKey, this.initializeBlock());
                this.updateHardDiskTable(dirKey);
                //get next data entry
                var nextDataKey = sessionStorage.getItem(dataKey).substring(1, this.headerSize);
                //reset file data 
                sessionStorage.setItem(dataKey, this.initializeBlock());
                this.updateHardDiskTable(dataKey);
                while (nextDataKey != "---") {
                    //get next data entry
                    dataKey = sessionStorage.getItem(nextDataKey).substring(1, this.headerSize);
                    //reset file data 
                    sessionStorage.setItem(nextDataKey, this.initializeBlock());
                    this.updateHardDiskTable(nextDataKey);
                    nextDataKey = dataKey;
                }
                //display success message if file is not a program's name ( a program in ready queue)
                if (!_IsProgramName) {
                    //Display suscces status
                    _StdOut.putText("SUCCESS : " + fileName + " has been deleted");
                }
            }
        };
        //read a specified file if it exists
        DeviceDriverFileSystem.prototype.readFile = function (fileName) {
            var dirKey = this.findFilename(fileName);
            if (dirKey == null) {
                _StdOut.putText("FAILURE");
                _StdOut.advanceLine();
                _StdOut.putText("File name does not exist");
            }
            else {
                var dirData = sessionStorage.getItem(dirKey);
                var dataKey = dirData.substring(1, this.headerSize);
                var fileData = "";
                var nextDataKey = sessionStorage.getItem(dataKey).substring(1, this.headerSize);
                //conver contents of file TSB linked to file name to asci string. Convert subsequent file TSB to string if it's not empty (---)
                fileData = fileData + this.convertToString(sessionStorage.getItem(dataKey).substring(this.headerSize));
                while (nextDataKey != "---") {
                    fileData = fileData + this.convertToString(sessionStorage.getItem(nextDataKey).substring(this.headerSize));
                    nextDataKey = sessionStorage.getItem(nextDataKey).substring(1, this.headerSize);
                }
                //_StdOut.putText("SUCCESS : Reading " + fileName + "...");
                //_StdOut.advanceLine();
                //display file content if file is not a program's name ( a program in ready queue)
                if (!_IsProgramName) {
                    _StdOut.putText(fileData);
                }
                return fileData;
            }
        };
        //write to or update a file
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
                if (contents.length <= this.dataSize && inUseBit == "1") {
                    if (headerTSB == "---") {
                        var newData = sessionStorage.getItem(dataKey).substring(this.headerSize);
                        var prevContents = this.convertToString(newData);
                        var newContents = prevContents + contents;
                        //recall write funtion if contents length is greater than 30
                        if (newContents.length > this.dataSize) {
                            this.writeToFile(fileName, newContents);
                        }
                        else {
                            dataData = inUseBit + headerTSB + newContents;
                            sessionStorage.setItem(dataKey, dataData);
                            this.writeData(dataKey, dataData);
                            this.updateHardDiskTable(dataKey);
                            if (!_IsProgramName) {
                                //Display suscces status if file is not a program's name ( a program in ready queue)
                                _StdOut.putText("SUCCESS : " + fileName + " has been updated");
                            }
                        }
                    }
                    else {
                        //get readerble data from hard disk and append the the new contents to it
                        var newData = sessionStorage.getItem(dataKey).substring(this.headerSize);
                        var prevContents = this.convertToString(newData);
                        var newContents = prevContents;
                        var newKey = sessionStorage.getItem(dataKey).substring(1, this.headerSize);
                        //reset header tsb
                        sessionStorage.setItem(dataKey, "1" + "---" + newData);
                        while (newKey != "---") {
                            //newKey = sessionStorage.getItem(headerTSB).substring(1, this.headerSize); 
                            newData = sessionStorage.getItem(newKey).substring(this.headerSize);
                            dataKey = sessionStorage.getItem(newKey).substring(1, this.headerSize);
                            newContents = newContents + this.convertToString(newData);
                            //reset header tsb
                            sessionStorage.setItem(newKey, "0" + "---" + newData);
                            //get next header tsb 
                            newKey = dataKey;
                        }
                        //alert("Appending file...  " + newContents + contents);
                        //recall write to function
                        this.writeToFile(fileName, newContents + contents);
                    }
                }
                else if (contents.length > this.dataSize && inUseBit == "1") {
                    if (headerTSB == "---") {
                        //first data to write to file 
                        var newDataKey = this.getFreeDataEntry();
                        headerTSB = newDataKey;
                        if (newDataKey != null) {
                            var contentSize = 0;
                            var nextContentSize = this.dataSize;
                            while (contentSize < contents.length) {
                                inUseBit = "1";
                                dataData = inUseBit + headerTSB + contents.substring(contentSize, nextContentSize);
                                this.writeData(dataKey, dataData);
                                this.updateHardDiskTable(dataKey);
                                contentSize = contentSize + this.dataSize;
                                //alert ("Contents Size =" + contentSize + " contents length =" + contents.length);
                                if ((contents.length - contentSize) <= (this.dataSize)) {
                                    //Write last contents less than or equal to 60 bytes to a file
                                    nextContentSize = contents.length;
                                    dataKey = this.getFreeDataEntry();
                                    headerTSB = "---";
                                }
                                else {
                                    nextContentSize = contentSize + this.dataSize;
                                    dataKey = this.getFreeDataEntry();
                                    //set inUse bit for file/data block to 1 and 
                                    dataData = sessionStorage.getItem(dataKey);
                                    dataData = "1" + dataData.substr(1);
                                    sessionStorage.setItem(dataKey, dataData);
                                    this.updateHardDiskTable(dataKey);
                                    newDataKey = this.getFreeDataEntry();
                                    headerTSB = newDataKey;
                                    if (newDataKey == null) {
                                        //TO DO:: Error if file is too large
                                        break;
                                    }
                                }
                            }
                            if (!_IsProgramName) {
                                //Display suscces status
                                _StdOut.putText("SUCCESS : " + fileName + " has been updated");
                            }
                        }
                        else {
                        }
                    }
                    else {
                        //get readerble data from hard disk and append the the new contents to it
                        var newData = sessionStorage.getItem(dataKey).substring(this.headerSize);
                        var prevContents = this.convertToString(newData);
                        var newContents = prevContents;
                        var newKey = sessionStorage.getItem(dataKey).substring(1, this.headerSize);
                        //reset header tsb
                        sessionStorage.setItem(dataKey, "1" + "---" + newData);
                        while (newKey != "---") {
                            newData = sessionStorage.getItem(newKey).substring(this.headerSize);
                            dataKey = sessionStorage.getItem(newKey).substring(1, this.headerSize);
                            newContents = newContents + this.convertToString(newData);
                            //reset header tsb
                            sessionStorage.setItem(newKey, "0" + "---" + newData);
                            //get next header tsb 
                            newKey = dataKey;
                        }
                        //recall write to function
                        this.writeToFile(fileName, newContents + contents);
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
                for (var j = 0; j < this.blocks; j++) {
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
        // check to see if a file is on HD
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
                    // return key if data of that key is equal to the converted hexString of file name and file name is in use
                    if (data == fileNameHex && inUseBit == "1") {
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

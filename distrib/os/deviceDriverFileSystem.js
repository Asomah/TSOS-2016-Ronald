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
            for (var i = 0; i < this.dataSize * 2; i++) {
                data += "0";
            }
            return data;
        };
        //converts a hex dtring back to regular string
        DeviceDriverFileSystem.prototype.convertToString = function (data) {
            var str = "";
            //alert("data Length = " + data.length);
            for (var i = 0; i < data.length; i += 2) {
                if ((data[i] + data[i + 1]) == "00") {
                    //alert("1 Function " + str);
                    return str;
                }
                else {
                    //alert("Data = " + data[i] + data[i + 1]);
                    str += String.fromCharCode(parseInt(data.substr(i, 2), 16));
                }
            }
            //alert("2 Function " + str);
            return str;
        };
        //converts the string-data provided to hex
        DeviceDriverFileSystem.prototype.convertToHex = function (data) {
            var hexString = "";
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
            //alert (key[0]);
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
                //this.writeData(dataKey, dataData);
                sessionStorage.setItem(dataKey, dataData);
                this.updateHardDiskTable(dirKey);
                this.updateHardDiskTable(dataKey);
                //Display suscces status
                _StdOut.putText("SUCESS : " + fileName + " has been created");
            }
        };
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
                //var dataData = 
                var fileData = "";
                var nextDataKey = sessionStorage.getItem(dataKey).substring(1, this.headerSize);
                if (nextDataKey == "---") {
                    fileData = fileData + this.convertToString(sessionStorage.getItem(dataKey).substring(this.headerSize));
                }
                else {
                    fileData = fileData + this.convertToString(sessionStorage.getItem(dataKey).substring(this.headerSize));
                    //nextDataKey = sessionStorage.getItem(dataKey).substring(1, this.headerSize);
                    //alert ("File =" + fileData  + "  Next Key =" + nextDataKey);
                    //var nextDataKey = sessionStorage.getItem(dataKey).substring(1, this.headerSize);
                    while (nextDataKey != "---") {
                        //alert ("File =" + this.convertToString(sessionStorage.getItem(nextDataKey).substring(this.headerSize)));
                        fileData = fileData + this.convertToString(sessionStorage.getItem(nextDataKey).substring(this.headerSize));
                        //fileData = fileData + this.convertToString(sessionStorage.getItem(dataKey).substring(this.headerSize));
                        //alert ("1 File =" + fileData );
                        nextDataKey = sessionStorage.getItem(nextDataKey).substring(1, this.headerSize);
                    }
                }
                _StdOut.putText("SUCESS : Reading " + fileName + "...");
                _StdOut.advanceLine();
                _StdOut.putText(fileData);
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
                if (contents.length <= this.dataSize && inUseBit == "1") {
                    alert("1 = " + contents.length);
                    if (headerTSB == "---") {
                        var newData = sessionStorage.getItem(dataKey).substring(this.headerSize);
                        // alert ("New Data = " + newData);
                        var prevContents = this.convertToString(newData);
                        var newContents = prevContents + contents;
                        //alert("Prev Cont = " +prevContents + " Lenght = " + prevContents.length);
                        //alert("Prev Cont = " +newContents + " Lenght = " + newContents.length);
                        //recall write funtion if contents length is greater than 30
                        if (newContents.length > this.dataSize) {
                            this.writeToFile(fileName, newContents);
                        }
                        else {
                            dataData = inUseBit + headerTSB + newContents;
                            sessionStorage.setItem(dataKey, dataData);
                            this.writeData(dataKey, dataData);
                            this.updateHardDiskTable(dataKey);
                            //Display suscces status
                            _StdOut.putText("SUCESS : " + fileName + " has been updated");
                        }
                    }
                    else {
                        //get readerble data from hard disk and append the the new contents to it
                        var newData = sessionStorage.getItem(dataKey).substring(this.headerSize);
                        // alert ("New Data = " + newData);
                        var prevContents = this.convertToString(newData);
                        var newContents = prevContents;
                        var newKey = sessionStorage.getItem(dataKey).substring(1, this.headerSize);
                        //var newData = "";
                        //var prevContents = "";
                        //var newContents = "";
                        while (newKey != "---") {
                            //newKey = sessionStorage.getItem(headerTSB).substring(1, this.headerSize); 
                            newData = sessionStorage.getItem(newKey).substring(this.headerSize);
                            // alert ("New Data = " + newData);
                            //prevContents = this.convertToString(newData);
                            newContents = newContents + this.convertToString(newData);
                            //get next header tsb 
                            newKey = sessionStorage.getItem(newKey).substring(1, this.headerSize);
                        }
                        //recall write to function
                        this.writeToFile(fileName, newContents);
                    }
                }
                else if (contents.length > this.dataSize && inUseBit == "1" && headerTSB == "---") {
                    alert("2 = " + contents.length);
                    //first data to write to file 
                    var newDataKey = this.getFreeDataEntry();
                    headerTSB = newDataKey;
                    if (newDataKey != null) {
                        var contentSize = 0;
                        var nextContentSize = this.dataSize;
                        while (contentSize < contents.length) {
                            inUseBit = "1";
                            dataData = inUseBit + headerTSB + contents.substring(contentSize, nextContentSize);
                            //alert("Contents subStr = " + contents.substring(contentSize, nextContentSize));
                            //alert("Contents Length = " + contents.substring(contentSize, nextContentSize).length);
                            //sessionStorage.setItem(dataKey, dataData);
                            this.writeData(dataKey, dataData);
                            this.updateHardDiskTable(dataKey);
                            contentSize = contentSize + this.dataSize;
                            if ((contents.length - contentSize) >= 0 && (contents.length - contentSize) <= (this.dataSize)) {
                                nextContentSize = contents.length;
                                dataKey = this.getFreeDataEntry();
                                //sessionStorage.setItem(dataKey, dataData);
                                headerTSB = "---";
                            }
                            else {
                                nextContentSize = contentSize + this.dataSize;
                                dataKey = this.getFreeDataEntry();
                                //newDataKey = 
                                //set inUse bit for file/data block to 1 and 
                                dataData = sessionStorage.getItem(dataKey);
                                dataData = "1" + dataData.substr(1);
                                sessionStorage.setItem(dataKey, dataData);
                                newDataKey = this.getFreeDataEntry();
                                headerTSB = newDataKey;
                                alert("More than one " + nextContentSize);
                                if (newDataKey == null) {
                                    //TO DO:: Error if file is too large
                                    break;
                                }
                            }
                        }
                        //Display suscces status
                        _StdOut.putText("SUCESS : " + fileName + " has been updated");
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

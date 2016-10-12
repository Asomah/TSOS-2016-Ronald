///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(bytes, memoryArr) {
            if (bytes === void 0) { bytes = _ProgramSize; }
            if (memoryArr === void 0) { memoryArr = new Array(_ProgramSize); }
            this.bytes = bytes;
            this.memoryArr = memoryArr;
        }
        MemoryManager.prototype.init = function () {
            for (var i = 0; i < _ProgramSize; i++) {
                _MemoryArray[i] = "00";
            }
        };
        //Load programInput into memory 
        MemoryManager.prototype.loadProgToMem = function () {
            var programInput = _ProgramInput.replace(/[\s]/g, "");
            for (var i = 0; i < programInput.length / 2; i = +2) {
                _Memory.memoryArr[i] = programInput[i] + programInput[i + 1];
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));

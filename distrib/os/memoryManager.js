///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        //Load programInput into memory 
        MemoryManager.prototype.loadProgToMem = function () {
            var programInput = _ProgramInput.replace(/[\s]/g, "");
            for (var i = 0; i < programInput.length / 2; i = +2) {
                _MemoryArray[i] = programInput[i] + programInput[i + 1];
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));

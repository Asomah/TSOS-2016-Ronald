///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
        }
        //Create default memory
        Memory.prototype.init = function () {
            for (var i = 0; i < _ProgramSize; i++) {
                _MemoryArray.push("00");
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));

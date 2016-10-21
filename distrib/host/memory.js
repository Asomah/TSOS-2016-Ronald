///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(base, limit) {
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = _MemorySize - 1; }
            this.base = base;
            this.limit = limit;
        }
        //Create default memory
        Memory.prototype.init = function () {
            for (var i = 0; i < _MemorySize; i++) {
                _MemoryArray[i] = "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));

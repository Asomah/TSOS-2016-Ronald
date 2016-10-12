///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(bytes, memoryArr) {
            if (bytes === void 0) { bytes = _ProgramSize; }
            if (memoryArr === void 0) { memoryArr = new Array(bytes); }
            this.bytes = bytes;
            this.memoryArr = memoryArr;
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.memoryArr.length; i++) {
                this.memoryArr[i] = "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));

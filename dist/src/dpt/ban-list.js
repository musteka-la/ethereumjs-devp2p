"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lru_cache_1 = __importDefault(require("lru-cache"));
var debug_1 = __importDefault(require("debug"));
var kbucket_1 = require("./kbucket");
var debug = debug_1.default('devp2p:dpt:ban-list');
var BanList = /** @class */ (function () {
    function BanList() {
        this.lru = new lru_cache_1.default({ max: 30000 }); // 10k should be enough (each peer obj can has 3 keys)
    }
    BanList.prototype.add = function (obj, maxAge) {
        var e_1, _a;
        try {
            for (var _b = __values(kbucket_1.KBucket.getKeys(obj)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                debug("add " + key + ", size: " + this.lru.length);
                this.lru.set(key, true, maxAge);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    BanList.prototype.has = function (obj) {
        var _this = this;
        return kbucket_1.KBucket.getKeys(obj).some(function (key) { return Boolean(_this.lru.get(key)); });
    };
    return BanList;
}());
exports.BanList = BanList;
//# sourceMappingURL=ban-list.js.map
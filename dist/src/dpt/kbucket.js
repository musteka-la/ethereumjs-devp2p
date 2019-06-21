"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
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
var events_1 = require("events");
var k_bucket_1 = __importDefault(require("k-bucket"));
var KBUCKET_SIZE = 16;
var KBUCKET_CONCURRENCY = 3;
var KBucket = /** @class */ (function (_super) {
    __extends(KBucket, _super);
    function KBucket(id) {
        var _this = _super.call(this) || this;
        _this._peers = new Map();
        _this._kbucket = new k_bucket_1.default({
            localNodeId: id,
            numberOfNodesPerKBucket: KBUCKET_SIZE,
            numberOfNodesToPing: KBUCKET_CONCURRENCY,
        });
        _this._kbucket.on('added', function (peer) {
            KBucket.getKeys(peer).forEach(function (key) { return _this._peers.set(key, peer); });
            _this.emit('added', peer);
        });
        _this._kbucket.on('removed', function (peer) {
            KBucket.getKeys(peer).forEach(function (key) { return _this._peers.delete(key); });
            _this.emit('removed', peer);
        });
        _this._kbucket.on('ping', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.emit.apply(_this, __spread(['ping'], args));
        });
        return _this;
    }
    KBucket.getKeys = function (obj) {
        if (Buffer.isBuffer(obj))
            return [obj.toString('hex')];
        if (typeof obj === 'string')
            return [obj];
        var keys = [];
        if (Buffer.isBuffer(obj.id))
            keys.push(obj.id.toString('hex'));
        if (obj.address && obj.port)
            keys.push(obj.address + ":" + obj.port);
        return keys;
    };
    KBucket.prototype.add = function (peer) {
        var _this = this;
        var isExists = KBucket.getKeys(peer).some(function (key) { return _this._peers.has(key); });
        if (!isExists)
            this._kbucket.add(peer);
    };
    KBucket.prototype.get = function (obj) {
        var e_1, _a;
        try {
            for (var _b = __values(KBucket.getKeys(obj)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var peer = this._peers.get(key);
                if (peer !== undefined)
                    return peer;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    };
    KBucket.prototype.getAll = function () {
        return this._kbucket.toArray();
    };
    KBucket.prototype.closest = function (id) {
        return this._kbucket.closest(id, KBUCKET_SIZE);
    };
    KBucket.prototype.remove = function (obj) {
        var peer = this.get(obj);
        if (peer !== null)
            this._kbucket.remove(peer.id);
    };
    return KBucket;
}(events_1.EventEmitter));
exports.KBucket = KBucket;
//# sourceMappingURL=kbucket.js.map
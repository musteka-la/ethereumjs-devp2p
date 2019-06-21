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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var ms_1 = __importDefault(require("ms"));
var events_1 = require("events");
var secp256k1_1 = require("secp256k1");
var crypto_1 = require("crypto");
var debug_1 = require("debug");
var util_1 = require("../util");
var kbucket_1 = require("./kbucket");
var ban_list_1 = require("./ban-list");
var server_1 = require("./server");
var debug = debug_1.debug('devp2p:dpt');
var DPT = /** @class */ (function (_super) {
    __extends(DPT, _super);
    function DPT(privateKey, options) {
        var _this = _super.call(this) || this;
        _this.privateKey = Buffer.from(privateKey);
        _this._id = util_1.pk2id(secp256k1_1.publicKeyCreate(_this.privateKey, false));
        _this.banlist = new ban_list_1.BanList();
        _this._kbucket = new kbucket_1.KBucket(_this._id);
        _this._kbucket.on('added', function (peer) { return _this.emit('peer:added', peer); });
        _this._kbucket.on('removed', function (peer) { return _this.emit('peer:removed', peer); });
        _this._kbucket.on('ping', _this._onKBucketPing);
        _this._server = new server_1.Server(_this, _this.privateKey, {
            createSocket: options.createSocket,
            timeout: options.timeout,
            endpoint: options.endpoint,
        });
        _this._server.once('listening', function () { return _this.emit('listening'); });
        _this._server.once('close', function () { return _this.emit('close'); });
        _this._server.on('peers', function (peers) { return _this._onServerPeers(peers); });
        _this._server.on('error', function (err) { return _this.emit('error', err); });
        var refreshInterval = options.refreshInterval || ms_1.default('60s');
        _this._refreshIntervalId = setInterval(function () { return _this.refresh(); }, refreshInterval);
        return _this;
    }
    DPT.prototype.bind = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = this._server).bind.apply(_a, __spread(args));
    };
    DPT.prototype.destroy = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearInterval(this._refreshIntervalId);
        (_a = this._server).destroy.apply(_a, __spread(args));
    };
    DPT.prototype._onKBucketPing = function (oldPeers, newPeer) {
        var _this = this;
        var e_1, _a;
        if (this.banlist.has(newPeer))
            return;
        var count = 0;
        var err = null;
        var _loop_1 = function (peer) {
            this_1._server
                .ping(peer)
                .catch(function (_err) {
                _this.banlist.add(peer, ms_1.default('5m'));
                _this._kbucket.remove(peer);
                err = err || _err;
            })
                .then(function () {
                if (++count < oldPeers.length)
                    return;
                if (err === null)
                    _this.banlist.add(newPeer, ms_1.default('5m'));
                else
                    _this._kbucket.add(newPeer);
            });
        };
        var this_1 = this;
        try {
            for (var oldPeers_1 = __values(oldPeers), oldPeers_1_1 = oldPeers_1.next(); !oldPeers_1_1.done; oldPeers_1_1 = oldPeers_1.next()) {
                var peer = oldPeers_1_1.value;
                _loop_1(peer);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (oldPeers_1_1 && !oldPeers_1_1.done && (_a = oldPeers_1.return)) _a.call(oldPeers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    DPT.prototype._onServerPeers = function (peers) {
        var e_2, _a;
        try {
            for (var peers_1 = __values(peers), peers_1_1 = peers_1.next(); !peers_1_1.done; peers_1_1 = peers_1.next()) {
                var peer = peers_1_1.value;
                this.addPeer(peer).catch(function () { });
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (peers_1_1 && !peers_1_1.done && (_a = peers_1.return)) _a.call(peers_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    DPT.prototype.bootstrap = function (peer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug("bootstrap with peer " + peer.address + ":" + peer.udpPort);
                        return [4 /*yield*/, this.addPeer(peer)];
                    case 1:
                        peer = _a.sent();
                        if (!this._id)
                            return [2 /*return*/];
                        this._server.findneighbours(peer, this._id);
                        return [2 /*return*/];
                }
            });
        });
    };
    DPT.prototype.addPeer = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, peer_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.banlist.has(obj))
                            throw new Error('Peer is banned');
                        debug("attempt adding peer " + obj.address + ":" + obj.udpPort);
                        peer = this._kbucket.get(obj);
                        if (peer !== null)
                            return [2 /*return*/, peer
                                // check that peer is alive
                            ];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._server.ping(obj)];
                    case 2:
                        peer_1 = _a.sent();
                        this.emit('peer:new', peer_1);
                        this._kbucket.add(peer_1);
                        return [2 /*return*/, peer_1];
                    case 3:
                        err_1 = _a.sent();
                        this.banlist.add(obj, ms_1.default('5m'));
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DPT.prototype.getPeer = function (obj) {
        return this._kbucket.get(obj);
    };
    DPT.prototype.getPeers = function () {
        return this._kbucket.getAll();
    };
    DPT.prototype.getClosestPeers = function (id) {
        return this._kbucket.closest(id);
    };
    DPT.prototype.removePeer = function (obj) {
        this._kbucket.remove(obj);
    };
    DPT.prototype.banPeer = function (obj, maxAge) {
        this.banlist.add(obj, maxAge);
        this._kbucket.remove(obj);
    };
    DPT.prototype.refresh = function () {
        var e_3, _a;
        var peers = this.getPeers();
        debug("call .refresh (" + peers.length + " peers in table)");
        try {
            for (var peers_2 = __values(peers), peers_2_1 = peers_2.next(); !peers_2_1.done; peers_2_1 = peers_2.next()) {
                var peer = peers_2_1.value;
                this._server.findneighbours(peer, crypto_1.randomBytes(64));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (peers_2_1 && !peers_2_1.done && (_a = peers_2.return)) _a.call(peers_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    return DPT;
}(events_1.EventEmitter));
exports.DPT = DPT;
//# sourceMappingURL=dpt.js.map
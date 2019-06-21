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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var dgram = __importStar(require("dgram"));
var ms_1 = __importDefault(require("ms"));
var debug_1 = require("debug");
var lru_cache_1 = __importDefault(require("lru-cache"));
var message_1 = require("./message");
var util_1 = require("../util");
var debug = debug_1.debug('devp2p:dpt:server');
var VERSION = 0x04;
var Server = /** @class */ (function (_super) {
    __extends(Server, _super);
    function Server(dpt, privateKey, options) {
        var _this = _super.call(this) || this;
        _this._dpt = dpt;
        _this._privateKey = privateKey;
        _this._timeout = options.timeout || ms_1.default('10s');
        _this._endpoint = options.endpoint || { address: '0.0.0.0', udpPort: null, tcpPort: null };
        _this._requests = new Map();
        _this._parityRequestMap = new Map();
        _this._requestsCache = new lru_cache_1.default({ max: 1000, maxAge: ms_1.default('1s'), stale: false });
        var createSocket = options.createSocket || dgram.createSocket.bind(null, { type: 'udp4' });
        _this._socket = createSocket();
        if (_this._socket) {
            _this._socket.once('listening', function () { return _this.emit('listening'); });
            _this._socket.once('close', function () { return _this.emit('close'); });
            _this._socket.on('error', function (err) { return _this.emit('error', err); });
            _this._socket.on('message', function (msg, rinfo) {
                try {
                    _this._handler(msg, rinfo);
                }
                catch (err) {
                    _this.emit('error', err);
                }
            });
        }
        return _this;
    }
    Server.prototype.bind = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._isAliveCheck();
        debug('call .bind');
        if (this._socket)
            (_a = this._socket).bind.apply(_a, __spread(args));
    };
    Server.prototype.destroy = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._isAliveCheck();
        debug('call .destroy');
        if (this._socket) {
            (_a = this._socket).close.apply(_a, __spread(args));
            this._socket = null;
        }
    };
    Server.prototype.ping = function (peer) {
        return __awaiter(this, void 0, void 0, function () {
            var rckey, promise, hash, deferred, rkey;
            var _this = this;
            return __generator(this, function (_a) {
                this._isAliveCheck();
                rckey = peer.address + ":" + peer.udpPort;
                promise = this._requestsCache.get(rckey);
                if (promise !== undefined)
                    return [2 /*return*/, promise];
                hash = this._send(peer, 'ping', {
                    version: VERSION,
                    from: this._endpoint,
                    to: peer,
                });
                deferred = util_1.createDeferred();
                rkey = hash.toString('hex');
                this._requests.set(rkey, {
                    peer: peer,
                    deferred: deferred,
                    timeoutId: setTimeout(function () {
                        if (_this._requests.get(rkey) !== undefined) {
                            debug("ping timeout: " + peer.address + ":" + peer.udpPort + " " + (peer.id && peer.id.toString('hex')));
                            _this._requests.delete(rkey);
                            deferred.reject(new Error("Timeout error: ping " + peer.address + ":" + peer.udpPort));
                        }
                        else {
                            return deferred.promise;
                        }
                    }, this._timeout),
                });
                this._requestsCache.set(rckey, deferred.promise);
                return [2 /*return*/, deferred.promise];
            });
        });
    };
    Server.prototype.findneighbours = function (peer, id) {
        this._isAliveCheck();
        this._send(peer, 'findneighbours', { id: id });
    };
    Server.prototype._isAliveCheck = function () {
        if (this._socket === null)
            throw new Error('Server already destroyed');
    };
    Server.prototype._send = function (peer, typename, data) {
        var _this = this;
        debug("send " + typename + " to " + peer.address + ":" + peer.udpPort + " (peerId: " + (peer.id &&
            peer.id.toString('hex')) + ")");
        var msg = message_1.encode(typename, data, this._privateKey);
        // Parity hack
        // There is a bug in Parity up to at lease 1.8.10 not echoing the hash from
        // discovery spec (hash: sha3(signature || packet-type || packet-data))
        // but just hashing the RLP-encoded packet data (see discovery.rs, on_ping())
        // 2018-02-28
        if (typename === 'ping') {
            var rkeyParity_1 = util_1.keccak256(msg.slice(98)).toString('hex');
            this._parityRequestMap.set(rkeyParity_1, msg.slice(0, 32).toString('hex'));
            setTimeout(function () {
                if (_this._parityRequestMap.get(rkeyParity_1) !== undefined) {
                    _this._parityRequestMap.delete(rkeyParity_1);
                }
            }, this._timeout);
        }
        if (this._socket && peer.udpPort)
            this._socket.send(msg, 0, msg.length, peer.udpPort, peer.address);
        return msg.slice(0, 32); // message id
    };
    Server.prototype._handler = function (msg, rinfo) {
        var _this = this;
        var info = message_1.decode(msg);
        var peerId = util_1.pk2id(info.publicKey);
        debug("received " + info.typename + " from " + rinfo.address + ":" + rinfo.port + " (peerId: " + peerId.toString('hex') + ")");
        // add peer if not in our table
        var peer = this._dpt.getPeer(peerId);
        if (peer === null && info.typename === 'ping' && info.data.from.udpPort !== null) {
            setTimeout(function () { return _this.emit('peers', [info.data.from]); }, ms_1.default('100ms'));
        }
        switch (info.typename) {
            case 'ping': {
                var remote = {
                    id: peerId,
                    udpPort: rinfo.port,
                    address: rinfo.address,
                };
                this._send(remote, 'pong', {
                    to: {
                        address: rinfo.address,
                        udpPort: rinfo.port,
                        tcpPort: info.data.from.tcpPort,
                    },
                    hash: msg.slice(0, 32),
                });
                break;
            }
            case 'pong': {
                var rkey = info.data.hash.toString('hex');
                var rkeyParity = this._parityRequestMap.get(rkey);
                if (rkeyParity) {
                    rkey = rkeyParity;
                    this._parityRequestMap.delete(rkeyParity);
                }
                var request = this._requests.get(rkey);
                if (request) {
                    this._requests.delete(rkey);
                    request.deferred.resolve({
                        id: peerId,
                        address: request.peer.address,
                        udpPort: request.peer.udpPort,
                        tcpPort: request.peer.tcpPort,
                    });
                }
                break;
            }
            case 'findneighbours': {
                var remote = {
                    id: peerId,
                    udpPort: rinfo.port,
                    address: rinfo.address,
                };
                this._send(remote, 'neighbours', {
                    peers: this._dpt.getClosestPeers(info.data.id),
                });
                break;
            }
            case 'neighbours': {
                this.emit('peers', info.data.peers.map(function (peer) { return peer.endpoint; }));
                break;
            }
        }
    };
    return Server;
}(events_1.EventEmitter));
exports.Server = Server;
//# sourceMappingURL=server.js.map
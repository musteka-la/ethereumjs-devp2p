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
var net = __importStar(require("net"));
var os = __importStar(require("os"));
var ms_1 = __importDefault(require("ms"));
var secp256k1_1 = require("secp256k1");
var events_1 = require("events");
var debug_1 = require("debug");
var lru_cache_1 = __importDefault(require("lru-cache"));
var package_json_1 = require("../../package.json");
var util_1 = require("../util");
var peer_1 = require("./peer");
var debug = debug_1.debug('devp2p:rlpx');
var RLPx = /** @class */ (function (_super) {
    __extends(RLPx, _super);
    function RLPx(privateKey, options) {
        var _this = _super.call(this) || this;
        _this._privateKey = Buffer.from(privateKey);
        _this._id = util_1.pk2id(secp256k1_1.publicKeyCreate(_this._privateKey, false));
        // options
        _this._timeout = options.timeout || ms_1.default('10s');
        _this._maxPeers = options.maxPeers || 10;
        _this._clientId = options.clientId
            ? Buffer.from(options.clientId)
            : Buffer.from("ethereumjs-devp2p/v" + package_json_1.version + "/" + os.platform() + "-" + os.arch() + "/nodejs");
        _this._remoteClientIdFilter = options.remoteClientIdFilter;
        _this._capabilities = options.capabilities;
        _this._listenPort = options.listenPort;
        // DPT
        _this._dpt = options.dpt || null;
        if (_this._dpt !== null) {
            _this._dpt.on('peer:new', function (peer) {
                if (!peer.tcpPort) {
                    _this._dpt.banPeer(peer, ms_1.default('5m'));
                    debug("banning peer with missing tcp port: " + peer.address);
                    return;
                }
                if (_this._peersLRU.has(peer.id.toString('hex')))
                    return;
                _this._peersLRU.set(peer.id.toString('hex'), true);
                if (_this._getOpenSlots() > 0)
                    return _this._connectToPeer(peer);
                _this._peersQueue.push({ peer: peer, ts: 0 }); // save to queue
            });
            _this._dpt.on('peer:removed', function (peer) {
                // remove from queue
                _this._peersQueue = _this._peersQueue.filter(function (item) { return !item.peer.id.equals(peer.id); });
            });
        }
        // internal
        _this._server = net.createServer();
        _this._server.once('listening', function () { return _this.emit('listening'); });
        _this._server.once('close', function () { return _this.emit('close'); });
        _this._server.on('error', function (err) { return _this.emit('error', err); });
        _this._server.on('connection', function (socket) { return _this._onConnect(socket, null); });
        _this._peers = new Map();
        _this._peersQueue = [];
        _this._peersLRU = new lru_cache_1.default({ max: 25000 });
        _this._refillIntervalId = setInterval(function () { return _this._refillConnections(); }, ms_1.default('10s'));
        return _this;
    }
    RLPx.prototype.listen = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._isAliveCheck();
        debug('call .listen');
        if (this._server)
            (_a = this._server).listen.apply(_a, __spread(args));
    };
    RLPx.prototype.destroy = function () {
        var _a, e_1, _b;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._isAliveCheck();
        debug('call .destroy');
        clearInterval(this._refillIntervalId);
        if (this._server)
            (_a = this._server).close.apply(_a, __spread(args));
        this._server = null;
        try {
            for (var _c = __values(this._peers.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var peerKey = _d.value;
                this.disconnect(Buffer.from(peerKey, 'hex'));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    RLPx.prototype.connect = function (peer) {
        return __awaiter(this, void 0, void 0, function () {
            var peerKey, deferred, socket;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!peer.tcpPort || !peer.address)
                            return [2 /*return*/];
                        this._isAliveCheck();
                        if (!Buffer.isBuffer(peer.id))
                            throw new TypeError('Expected peer.id as Buffer');
                        peerKey = peer.id.toString('hex');
                        if (this._peers.has(peerKey))
                            throw new Error('Already connected');
                        if (this._getOpenSlots() === 0)
                            throw new Error('Too many peers already connected');
                        debug("connect to " + peer.address + ":" + peer.tcpPort + " (id: " + peerKey + ")");
                        deferred = util_1.createDeferred();
                        socket = new net.Socket();
                        this._peers.set(peerKey, socket);
                        socket.once('close', function () {
                            _this._peers.delete(peerKey);
                            _this._refillConnections();
                        });
                        socket.once('error', deferred.reject);
                        socket.setTimeout(this._timeout, function () { return deferred.reject(new Error('Connection timeout')); });
                        socket.connect(peer.tcpPort, peer.address, deferred.resolve);
                        return [4 /*yield*/, deferred.promise];
                    case 1:
                        _a.sent();
                        this._onConnect(socket, peer.id);
                        return [2 /*return*/];
                }
            });
        });
    };
    RLPx.prototype.getPeers = function () {
        return Array.from(this._peers.values()).filter(function (item) { return item instanceof peer_1.Peer; });
    };
    RLPx.prototype.disconnect = function (id) {
        var peer = this._peers.get(id.toString('hex'));
        if (peer instanceof peer_1.Peer)
            peer.disconnect(peer_1.DISCONNECT_REASONS.CLIENT_QUITTING);
    };
    RLPx.prototype._isAlive = function () {
        return this._server !== null;
    };
    RLPx.prototype._isAliveCheck = function () {
        if (!this._isAlive())
            throw new Error('Server already destroyed');
    };
    RLPx.prototype._getOpenSlots = function () {
        return Math.max(this._maxPeers - this._peers.size, 0);
    };
    RLPx.prototype._connectToPeer = function (peer) {
        var _this = this;
        this.connect(peer).catch(function (err) {
            if (_this._dpt === null)
                return;
            if (err.code === 'ECONNRESET' || err.toString().includes('Connection timeout')) {
                _this._dpt.banPeer(peer, ms_1.default('5m'));
            }
        });
    };
    RLPx.prototype._onConnect = function (socket, peerId) {
        var _this = this;
        debug("connected to " + socket.remoteAddress + ":" + socket.remotePort + ", handshake waiting..");
        var peer = new peer_1.Peer({
            socket: socket,
            remoteId: peerId,
            privateKey: this._privateKey,
            id: this._id,
            timeout: this._timeout,
            clientId: this._clientId,
            remoteClientIdFilter: this._remoteClientIdFilter,
            capabilities: this._capabilities,
            port: this._listenPort,
        });
        peer.on('error', function (err) { return _this.emit('peer:error', peer, err); });
        // handle incoming connection
        if (peerId === null && this._getOpenSlots() === 0) {
            peer.once('connect', function () { return peer.disconnect(peer_1.DISCONNECT_REASONS.TOO_MANY_PEERS); });
            socket.once('error', function () { });
            return;
        }
        peer.once('connect', function () {
            var msg = "handshake with " + socket.remoteAddress + ":" + socket.remotePort + " was successful";
            if (peer._eciesSession._gotEIP8Auth === true) {
                msg += " (peer eip8 auth)";
            }
            if (peer._eciesSession._gotEIP8Ack === true) {
                msg += " (peer eip8 ack)";
            }
            debug(msg);
            var id = peer.getId();
            if (id && id.equals(_this._id)) {
                return peer.disconnect(peer_1.DISCONNECT_REASONS.SAME_IDENTITY);
            }
            var peerKey = id.toString('hex');
            var item = _this._peers.get(peerKey);
            if (item && item instanceof peer_1.Peer) {
                return peer.disconnect(peer_1.DISCONNECT_REASONS.ALREADY_CONNECTED);
            }
            _this._peers.set(peerKey, peer);
            _this.emit('peer:added', peer);
        });
        peer.once('close', function (reason, disconnectWe) {
            if (disconnectWe) {
                debug("disconnect from " + socket.remoteAddress + ":" + socket.remotePort + ", reason: " + String(reason));
            }
            else {
                debug(socket.remoteAddress + ":" + socket.remotePort + " disconnect, reason: " + String(reason));
            }
            if (!disconnectWe && reason === peer_1.DISCONNECT_REASONS.TOO_MANY_PEERS) {
                // hack
                _this._peersQueue.push({
                    peer: {
                        id: peer.getId(),
                        address: peer._socket.remoteAddress,
                        tcpPort: peer._socket.remotePort,
                    },
                    ts: Date.now() + ms_1.default('5m'),
                });
            }
            var id = peer.getId();
            if (id) {
                var peerKey = id.toString('hex');
                _this._peers.delete(peerKey);
                _this.emit('peer:removed', peer, reason, disconnectWe);
            }
        });
    };
    RLPx.prototype._refillConnections = function () {
        var _this = this;
        if (!this._isAlive())
            return;
        debug("refill connections.. queue size: " + this._peersQueue.length + ", open slots: " + this._getOpenSlots());
        this._peersQueue = this._peersQueue.filter(function (item) {
            if (_this._getOpenSlots() === 0)
                return true;
            if (item.ts > Date.now())
                return true;
            _this._connectToPeer(item.peer);
            return false;
        });
    };
    return RLPx;
}(events_1.EventEmitter));
exports.RLPx = RLPx;
//# sourceMappingURL=rlpx.js.map
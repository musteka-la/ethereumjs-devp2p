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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var rlp_encoding_1 = __importDefault(require("rlp-encoding"));
var util = __importStar(require("../util"));
var bl_1 = __importDefault(require("bl"));
var ms_1 = __importDefault(require("ms"));
var debug_1 = require("debug");
var util_1 = require("../util");
var ecies_1 = require("./ecies");
var debug = debug_1.debug('devp2p:rlpx:peer');
exports.BASE_PROTOCOL_VERSION = 4;
exports.BASE_PROTOCOL_LENGTH = 16;
exports.PING_INTERVAL = ms_1.default('15s');
var PREFIXES;
(function (PREFIXES) {
    PREFIXES[PREFIXES["HELLO"] = 0] = "HELLO";
    PREFIXES[PREFIXES["DISCONNECT"] = 1] = "DISCONNECT";
    PREFIXES[PREFIXES["PING"] = 2] = "PING";
    PREFIXES[PREFIXES["PONG"] = 3] = "PONG";
})(PREFIXES = exports.PREFIXES || (exports.PREFIXES = {}));
var DISCONNECT_REASONS;
(function (DISCONNECT_REASONS) {
    DISCONNECT_REASONS[DISCONNECT_REASONS["DISCONNECT_REQUESTED"] = 0] = "DISCONNECT_REQUESTED";
    DISCONNECT_REASONS[DISCONNECT_REASONS["NETWORK_ERROR"] = 1] = "NETWORK_ERROR";
    DISCONNECT_REASONS[DISCONNECT_REASONS["PROTOCOL_ERROR"] = 2] = "PROTOCOL_ERROR";
    DISCONNECT_REASONS[DISCONNECT_REASONS["USELESS_PEER"] = 3] = "USELESS_PEER";
    DISCONNECT_REASONS[DISCONNECT_REASONS["TOO_MANY_PEERS"] = 4] = "TOO_MANY_PEERS";
    DISCONNECT_REASONS[DISCONNECT_REASONS["ALREADY_CONNECTED"] = 5] = "ALREADY_CONNECTED";
    DISCONNECT_REASONS[DISCONNECT_REASONS["INCOMPATIBLE_VERSION"] = 6] = "INCOMPATIBLE_VERSION";
    DISCONNECT_REASONS[DISCONNECT_REASONS["INVALID_IDENTITY"] = 7] = "INVALID_IDENTITY";
    DISCONNECT_REASONS[DISCONNECT_REASONS["CLIENT_QUITTING"] = 8] = "CLIENT_QUITTING";
    DISCONNECT_REASONS[DISCONNECT_REASONS["UNEXPECTED_IDENTITY"] = 9] = "UNEXPECTED_IDENTITY";
    DISCONNECT_REASONS[DISCONNECT_REASONS["SAME_IDENTITY"] = 10] = "SAME_IDENTITY";
    DISCONNECT_REASONS[DISCONNECT_REASONS["TIMEOUT"] = 11] = "TIMEOUT";
    DISCONNECT_REASONS[DISCONNECT_REASONS["SUBPROTOCOL_ERROR"] = 16] = "SUBPROTOCOL_ERROR";
})(DISCONNECT_REASONS = exports.DISCONNECT_REASONS || (exports.DISCONNECT_REASONS = {}));
var Peer = /** @class */ (function (_super) {
    __extends(Peer, _super);
    function Peer(options) {
        var _this = _super.call(this) || this;
        // hello data
        _this._clientId = options.clientId;
        _this._capabilities = options.capabilities;
        _this._port = options.port;
        _this._id = options.id;
        _this._remoteClientIdFilter = options.remoteClientIdFilter;
        // ECIES session
        _this._remoteId = options.remoteId;
        _this._EIP8 = options.EIP8 !== undefined ? options.EIP8 : true;
        _this._eciesSession = new ecies_1.ECIES(options.privateKey, _this._id, _this._remoteId);
        // Auth, Ack, Header, Body
        _this._state = 'Auth';
        _this._weHello = null;
        _this._hello = null;
        _this._nextPacketSize = 307;
        // socket
        _this._socket = options.socket;
        _this._socket.on('error', function (err) { return _this.emit('error', err); });
        _this._socket.once('close', function () {
            clearInterval(_this._pingIntervalId);
            clearTimeout(_this._pingTimeoutId);
            _this._closed = true;
            if (_this._connected)
                _this.emit('close', _this._disconnectReason, _this._disconnectWe);
        });
        var bl = new bl_1.default();
        _this._socket.on('data', function (data) {
            if (_this._closed)
                return;
            bl.append(data);
            while (bl.length >= _this._nextPacketSize) {
                var bytesCount = _this._nextPacketSize;
                var parseData = bl.slice(0, bytesCount);
                try {
                    if (_this._state === 'Auth') {
                        if (!_this._eciesSession._gotEIP8Auth) {
                            try {
                                _this._eciesSession.parseAuthPlain(parseData);
                            }
                            catch (err) {
                                _this._eciesSession._gotEIP8Auth = true;
                                _this._nextPacketSize = util.buffer2int(data.slice(0, 2)) + 2;
                                continue;
                            }
                        }
                        else {
                            _this._eciesSession.parseAuthEIP8(parseData);
                        }
                        _this._state = 'Header';
                        _this._nextPacketSize = 32;
                        process.nextTick(function () { return _this._sendAck(); });
                    }
                    else if (_this._state === 'Ack') {
                        if (!_this._eciesSession._gotEIP8Ack) {
                            try {
                                _this._eciesSession.parseAckPlain(parseData);
                                debug("Received ack (old format) from " + _this._socket.remoteAddress + ":" + _this._socket.remotePort);
                            }
                            catch (err) {
                                _this._eciesSession._gotEIP8Ack = true;
                                _this._nextPacketSize = util.buffer2int(data.slice(0, 2)) + 2;
                                continue;
                            }
                        }
                        else {
                            _this._eciesSession.parseAckEIP8(parseData);
                            debug("Received ack (EIP8) from " + _this._socket.remoteAddress + ":" + _this._socket.remotePort);
                        }
                        _this._state = 'Header';
                        _this._nextPacketSize = 32;
                        process.nextTick(function () { return _this._sendHello(); });
                    }
                    else {
                        _this._parsePacketContent(parseData);
                    }
                }
                catch (err) {
                    _this.emit('error', err);
                }
                bl.consume(bytesCount);
            }
        });
        _this._connected = false;
        _this._closed = false;
        _this._disconnectWe = null;
        _this._pingIntervalId = null;
        _this._pingTimeout = options.timeout;
        _this._pingTimeoutId = null;
        // sub-protocols
        _this._protocols = [];
        // send AUTH if outgoing connection
        if (_this._remoteId !== null)
            _this._sendAuth();
        return _this;
    }
    Peer.prototype._parseSocketData = function (data) { };
    Peer.prototype._parsePacketContent = function (data) {
        switch (this._state) {
            case 'Header':
                debug("Received header " + this._socket.remoteAddress + ":" + this._socket.remotePort);
                var size = this._eciesSession.parseHeader(data);
                if (!size) {
                    debug('invalid header size!');
                    return;
                }
                this._state = 'Body';
                this._nextPacketSize = size + 16;
                if (size % 16 > 0)
                    this._nextPacketSize += 16 - (size % 16);
                break;
            case 'Body':
                var body = this._eciesSession.parseBody(data);
                if (!body) {
                    debug('empty body!');
                    return;
                }
                debug("Received body " + this._socket.remoteAddress + ":" + this._socket.remotePort + " " + body.toString('hex'));
                this._state = 'Header';
                this._nextPacketSize = 32;
                // RLP hack
                var code = body[0];
                if (code === 0x80)
                    code = 0;
                if (code !== PREFIXES.HELLO && code !== PREFIXES.DISCONNECT && this._hello === null) {
                    return this.disconnect(DISCONNECT_REASONS.PROTOCOL_ERROR);
                }
                var obj = this._getProtocol(code);
                if (obj === undefined)
                    return this.disconnect(DISCONNECT_REASONS.PROTOCOL_ERROR);
                var msgCode = code - obj.offset;
                var prefix = this.getMsgPrefix(msgCode);
                debug("Received " + prefix + " (message code: " + code + " - " + obj.offset + " = " + msgCode + ") " + this._socket.remoteAddress + ":" + this._socket.remotePort);
                try {
                    obj.protocol._handleMessage(msgCode, body.slice(1));
                }
                catch (err) {
                    this.disconnect(DISCONNECT_REASONS.SUBPROTOCOL_ERROR);
                    this.emit('error', err);
                }
                break;
        }
    };
    Peer.prototype._getProtocol = function (code) {
        var e_1, _a;
        if (code < exports.BASE_PROTOCOL_LENGTH)
            return { protocol: this, offset: 0 };
        try {
            for (var _b = __values(this._protocols), _c = _b.next(); !_c.done; _c = _b.next()) {
                var obj = _c.value;
                if (code >= obj.offset && code < obj.offset + obj.length)
                    return obj;
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
    Peer.prototype._handleMessage = function (code, msg) {
        var e_2, _a, e_3, _b, e_4, _c;
        var _this = this;
        var payload = rlp_encoding_1.default.decode(msg);
        switch (code) {
            case PREFIXES.HELLO:
                this._hello = {
                    protocolVersion: util_1.buffer2int(payload[0]),
                    clientId: payload[1].toString(),
                    capabilities: payload[2].map(function (item) {
                        return { name: item[0].toString(), version: util_1.buffer2int(item[1]) };
                    }),
                    port: util_1.buffer2int(payload[3]),
                    id: payload[4],
                };
                if (this._remoteId === null) {
                    this._remoteId = Buffer.from(this._hello.id);
                }
                else if (!this._remoteId.equals(this._hello.id)) {
                    return this.disconnect(DISCONNECT_REASONS.INVALID_IDENTITY);
                }
                if (this._remoteClientIdFilter) {
                    try {
                        for (var _d = __values(this._remoteClientIdFilter), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var filterStr = _e.value;
                            if (this._hello.clientId.toLowerCase().includes(filterStr.toLowerCase())) {
                                return this.disconnect(DISCONNECT_REASONS.USELESS_PEER);
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                var shared_1 = {};
                try {
                    for (var _f = __values(this._hello.capabilities), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var item = _g.value;
                        try {
                            for (var _h = (e_4 = void 0, __values(this._capabilities)), _j = _h.next(); !_j.done; _j = _h.next()) {
                                var obj = _j.value;
                                if (obj.name !== item.name || obj.version !== item.version)
                                    continue;
                                if (shared_1[obj.name] && shared_1[obj.name].version > obj.version)
                                    continue;
                                shared_1[obj.name] = obj;
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                var offset_1 = exports.BASE_PROTOCOL_LENGTH;
                this._protocols = Object.keys(shared_1)
                    .map(function (key) { return shared_1[key]; })
                    .sort(function (obj1, obj2) { return (obj1.name < obj2.name ? -1 : 1); })
                    .map(function (obj) {
                    var _offset = offset_1;
                    offset_1 += obj.length;
                    var SubProtocol = obj.constructor;
                    var protocol = new SubProtocol(obj.version, _this, function (code, data) {
                        if (code > obj.length)
                            throw new Error('Code out of range');
                        _this._sendMessage(_offset + code, data);
                    });
                    return { protocol: protocol, offset: _offset, length: obj.length };
                });
                if (this._protocols.length === 0) {
                    return this.disconnect(DISCONNECT_REASONS.USELESS_PEER);
                }
                this._connected = true;
                this._pingIntervalId = setInterval(function () { return _this._sendPing(); }, exports.PING_INTERVAL);
                if (this._weHello) {
                    this.emit('connect');
                }
                break;
            case PREFIXES.DISCONNECT:
                this._closed = true;
                this._disconnectReason = payload[0].length === 0 ? 0 : payload[0][0];
                this._disconnectWe = false;
                this._socket.end();
                break;
            case PREFIXES.PING:
                this._sendPong();
                break;
            case PREFIXES.PONG:
                clearTimeout(this._pingTimeoutId);
                break;
        }
    };
    Peer.prototype._sendAuth = function () {
        if (this._closed)
            return;
        debug("Send auth (EIP8: " + this._EIP8 + ") to " + this._socket.remoteAddress + ":" + this._socket.remotePort);
        if (this._EIP8) {
            var authEIP8 = this._eciesSession.createAuthEIP8();
            if (!authEIP8)
                return;
            this._socket.write(authEIP8);
        }
        else {
            var authNonEIP8 = this._eciesSession.createAuthNonEIP8();
            if (!authNonEIP8)
                return;
            this._socket.write(authNonEIP8);
        }
        this._state = 'Ack';
        this._nextPacketSize = 210;
    };
    Peer.prototype._sendAck = function () {
        if (this._closed)
            return;
        debug("Send ack (EIP8: " + this._eciesSession._gotEIP8Auth + ") to " + this._socket.remoteAddress + ":" + this._socket.remotePort);
        if (this._eciesSession._gotEIP8Auth) {
            var ackEIP8 = this._eciesSession.createAckEIP8();
            if (!ackEIP8)
                return;
            this._socket.write(ackEIP8);
        }
        else {
            var ackOld = this._eciesSession.createAckOld();
            if (!ackOld)
                return;
            this._socket.write(ackOld);
        }
        this._state = 'Header';
        this._nextPacketSize = 32;
        this._sendHello();
    };
    Peer.prototype._sendMessage = function (code, data) {
        if (this._closed)
            return false;
        var msg = Buffer.concat([rlp_encoding_1.default.encode(code), data]);
        var header = this._eciesSession.createHeader(msg.length);
        if (!header)
            return;
        this._socket.write(header);
        var body = this._eciesSession.createBody(msg);
        if (!body)
            return;
        this._socket.write(body);
        return true;
    };
    Peer.prototype._sendHello = function () {
        debug("Send HELLO to " + this._socket.remoteAddress + ":" + this._socket.remotePort);
        var payload = [
            util_1.int2buffer(exports.BASE_PROTOCOL_VERSION),
            this._clientId,
            this._capabilities.map(function (obj) { return [Buffer.from(obj.name), util_1.int2buffer(obj.version)]; }),
            this._port === null ? Buffer.allocUnsafe(0) : util_1.int2buffer(this._port),
            this._id,
        ];
        if (!this._closed) {
            if (this._sendMessage(PREFIXES.HELLO, rlp_encoding_1.default.encode(payload))) {
                this._weHello = payload;
            }
            if (this._hello) {
                this.emit('connect');
            }
        }
    };
    Peer.prototype._sendPing = function () {
        var _this = this;
        debug("Send PING to " + this._socket.remoteAddress + ":" + this._socket.remotePort);
        var data = rlp_encoding_1.default.encode([]);
        if (!this._sendMessage(PREFIXES.PING, data))
            return;
        clearTimeout(this._pingTimeoutId);
        this._pingTimeoutId = setTimeout(function () {
            _this.disconnect(DISCONNECT_REASONS.TIMEOUT);
        }, this._pingTimeout);
    };
    Peer.prototype._sendPong = function () {
        debug("Send PONG to " + this._socket.remoteAddress + ":" + this._socket.remotePort);
        var data = rlp_encoding_1.default.encode([]);
        this._sendMessage(PREFIXES.PONG, data);
    };
    Peer.prototype._sendDisconnect = function (reason) {
        var _this = this;
        debug("Send DISCONNECT to " + this._socket.remoteAddress + ":" + this._socket.remotePort + " (reason: " + this.getDisconnectPrefix(reason) + ")");
        var data = rlp_encoding_1.default.encode(reason);
        if (!this._sendMessage(PREFIXES.DISCONNECT, data))
            return;
        this._disconnectReason = reason;
        this._disconnectWe = true;
        this._closed = true;
        setTimeout(function () { return _this._socket.end(); }, ms_1.default('2s'));
    };
    Peer.prototype.getId = function () {
        if (this._remoteId === null)
            return null;
        return Buffer.from(this._remoteId);
    };
    Peer.prototype.getHelloMessage = function () {
        return this._hello;
    };
    Peer.prototype.getProtocols = function () {
        return this._protocols.map(function (obj) { return obj.protocol; });
    };
    Peer.prototype.getMsgPrefix = function (code) {
        return PREFIXES[code];
    };
    Peer.prototype.getDisconnectPrefix = function (code) {
        return DISCONNECT_REASONS[code];
    };
    Peer.prototype.disconnect = function (reason) {
        if (reason === void 0) { reason = DISCONNECT_REASONS.DISCONNECT_REQUESTED; }
        this._sendDisconnect(reason);
    };
    return Peer;
}(events_1.EventEmitter));
exports.Peer = Peer;
//# sourceMappingURL=peer.js.map
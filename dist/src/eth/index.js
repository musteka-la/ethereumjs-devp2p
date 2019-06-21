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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var rlp_encoding_1 = __importDefault(require("rlp-encoding"));
var ms_1 = __importDefault(require("ms"));
var util_1 = require("../util");
var peer_1 = require("../rlpx/peer");
var debug_1 = require("debug");
var debug = debug_1.debug('devp2p:eth');
var ETH = /** @class */ (function (_super) {
    __extends(ETH, _super);
    function ETH(version, peer, send) {
        var _this = _super.call(this) || this;
        _this._version = version;
        _this._peer = peer;
        _this._send = send;
        _this._status = null;
        _this._peerStatus = null;
        _this._statusTimeoutId = setTimeout(function () {
            _this._peer.disconnect(peer_1.DISCONNECT_REASONS.TIMEOUT);
        }, ms_1.default('5s'));
        return _this;
    }
    ETH.prototype._handleMessage = function (code, data) {
        var payload = rlp_encoding_1.default.decode(data);
        if (code !== ETH.MESSAGE_CODES.STATUS) {
            debug("Received " + this.getMsgPrefix(code) + " message from " + this._peer._socket.remoteAddress + ":" + this._peer._socket.remotePort + ": " + data.toString('hex'));
        }
        switch (code) {
            case ETH.MESSAGE_CODES.STATUS:
                util_1.assertEq(this._peerStatus, null, 'Uncontrolled status message');
                this._peerStatus = payload;
                debug("Received " + this.getMsgPrefix(code) + " message from " + this._peer._socket.remoteAddress + ":" + this._peer._socket.remotePort + ": : " + (this._peerStatus ? this._getStatusString(this._peerStatus) : ''));
                this._handleStatus();
                break;
            case ETH.MESSAGE_CODES.NEW_BLOCK_HASHES:
            case ETH.MESSAGE_CODES.TX:
            case ETH.MESSAGE_CODES.GET_BLOCK_HEADERS:
            case ETH.MESSAGE_CODES.BLOCK_HEADERS:
            case ETH.MESSAGE_CODES.GET_BLOCK_BODIES:
            case ETH.MESSAGE_CODES.BLOCK_BODIES:
            case ETH.MESSAGE_CODES.NEW_BLOCK:
                if (this._version >= ETH.eth62.version)
                    break;
                return;
            case ETH.MESSAGE_CODES.GET_NODE_DATA:
            case ETH.MESSAGE_CODES.NODE_DATA:
            case ETH.MESSAGE_CODES.GET_RECEIPTS:
            case ETH.MESSAGE_CODES.RECEIPTS:
                if (this._version >= ETH.eth63.version)
                    break;
                return;
            default:
                return;
        }
        this.emit('message', code, payload);
    };
    ETH.prototype._handleStatus = function () {
        if (this._status === null || this._peerStatus === null)
            return;
        clearTimeout(this._statusTimeoutId);
        util_1.assertEq(this._status[0], this._peerStatus[0], 'Protocol version mismatch');
        util_1.assertEq(this._status[1], this._peerStatus[1], 'NetworkId mismatch');
        util_1.assertEq(this._status[4], this._peerStatus[4], 'Genesis block mismatch');
        this.emit('status', {
            networkId: this._peerStatus[1],
            td: Buffer.from(this._peerStatus[2]),
            bestHash: Buffer.from(this._peerStatus[3]),
            genesisHash: Buffer.from(this._peerStatus[4]),
        });
    };
    ETH.prototype.getVersion = function () {
        return this._version;
    };
    ETH.prototype._getStatusString = function (status) {
        var sStr = "[V:" + util_1.buffer2int(status[0]) + ", NID:" + util_1.buffer2int(status[1]) + ", TD:" + util_1.buffer2int(status[2]);
        sStr += ", BestH:" + status[3].toString('hex') + ", GenH:" + status[4].toString('hex') + "]";
        return sStr;
    };
    ETH.prototype.sendStatus = function (status) {
        if (this._status !== null)
            return;
        this._status = [
            util_1.int2buffer(this._version),
            util_1.int2buffer(status.networkId),
            status.td,
            status.bestHash,
            status.genesisHash,
        ];
        debug("Send STATUS message to " + this._peer._socket.remoteAddress + ":" + this._peer._socket.remotePort + " (eth" + this._version + "): " + this._getStatusString(this._status));
        this._send(ETH.MESSAGE_CODES.STATUS, rlp_encoding_1.default.encode(this._status));
        this._handleStatus();
    };
    ETH.prototype.sendMessage = function (code, payload) {
        debug("Send " + this.getMsgPrefix(code) + " message to " + this._peer._socket.remoteAddress + ":" + this._peer._socket.remotePort + ": " + rlp_encoding_1.default.encode(payload).toString('hex'));
        switch (code) {
            case ETH.MESSAGE_CODES.STATUS:
                throw new Error('Please send status message through .sendStatus');
            case ETH.MESSAGE_CODES.NEW_BLOCK_HASHES:
            case ETH.MESSAGE_CODES.TX:
            case ETH.MESSAGE_CODES.GET_BLOCK_HEADERS:
            case ETH.MESSAGE_CODES.BLOCK_HEADERS:
            case ETH.MESSAGE_CODES.GET_BLOCK_BODIES:
            case ETH.MESSAGE_CODES.BLOCK_BODIES:
            case ETH.MESSAGE_CODES.NEW_BLOCK:
                if (this._version >= ETH.eth62.version)
                    break;
                throw new Error("Code " + code + " not allowed with version " + this._version);
            case ETH.MESSAGE_CODES.GET_NODE_DATA:
            case ETH.MESSAGE_CODES.NODE_DATA:
            case ETH.MESSAGE_CODES.GET_RECEIPTS:
            case ETH.MESSAGE_CODES.RECEIPTS:
                if (this._version >= ETH.eth63.version)
                    break;
                throw new Error("Code " + code + " not allowed with version " + this._version);
            default:
                throw new Error("Unknown code " + code);
        }
        this._send(code, rlp_encoding_1.default.encode(payload));
    };
    ETH.prototype.getMsgPrefix = function (msgCode) {
        return ETH.MESSAGE_CODES[msgCode];
    };
    ETH.eth62 = { name: 'eth', version: 62, length: 8, constructor: ETH };
    ETH.eth63 = { name: 'eth', version: 63, length: 17, constructor: ETH };
    return ETH;
}(events_1.EventEmitter));
exports.ETH = ETH;
(function (ETH) {
    var MESSAGE_CODES;
    (function (MESSAGE_CODES) {
        // eth62
        MESSAGE_CODES[MESSAGE_CODES["STATUS"] = 0] = "STATUS";
        MESSAGE_CODES[MESSAGE_CODES["NEW_BLOCK_HASHES"] = 1] = "NEW_BLOCK_HASHES";
        MESSAGE_CODES[MESSAGE_CODES["TX"] = 2] = "TX";
        MESSAGE_CODES[MESSAGE_CODES["GET_BLOCK_HEADERS"] = 3] = "GET_BLOCK_HEADERS";
        MESSAGE_CODES[MESSAGE_CODES["BLOCK_HEADERS"] = 4] = "BLOCK_HEADERS";
        MESSAGE_CODES[MESSAGE_CODES["GET_BLOCK_BODIES"] = 5] = "GET_BLOCK_BODIES";
        MESSAGE_CODES[MESSAGE_CODES["BLOCK_BODIES"] = 6] = "BLOCK_BODIES";
        MESSAGE_CODES[MESSAGE_CODES["NEW_BLOCK"] = 7] = "NEW_BLOCK";
        // eth63
        MESSAGE_CODES[MESSAGE_CODES["GET_NODE_DATA"] = 13] = "GET_NODE_DATA";
        MESSAGE_CODES[MESSAGE_CODES["NODE_DATA"] = 14] = "NODE_DATA";
        MESSAGE_CODES[MESSAGE_CODES["GET_RECEIPTS"] = 15] = "GET_RECEIPTS";
        MESSAGE_CODES[MESSAGE_CODES["RECEIPTS"] = 16] = "RECEIPTS";
    })(MESSAGE_CODES = ETH.MESSAGE_CODES || (ETH.MESSAGE_CODES = {}));
})(ETH = exports.ETH || (exports.ETH = {}));
exports.ETH = ETH;
//# sourceMappingURL=index.js.map
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
var debug_1 = require("debug");
var util_1 = require("../util");
var peer_1 = require("../rlpx/peer");
var debug = debug_1.debug('devp2p:les');
exports.DEFAULT_ANNOUNCE_TYPE = 1;
var LES = /** @class */ (function (_super) {
    __extends(LES, _super);
    function LES(version, peer, send) {
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
    LES.prototype._handleMessage = function (code, data) {
        var payload = rlp_encoding_1.default.decode(data);
        if (code !== LES.MESSAGE_CODES.STATUS) {
            debug("Received " + this.getMsgPrefix(code) + " message from " + this._peer._socket.remoteAddress + ":" + this._peer._socket.remotePort + ": " + data.toString('hex'));
        }
        switch (code) {
            case LES.MESSAGE_CODES.STATUS:
                util_1.assertEq(this._peerStatus, null, 'Uncontrolled status message');
                var statusArray_1 = {};
                payload.forEach(function (value) {
                    statusArray_1[value[0].toString()] = value[1];
                });
                this._peerStatus = statusArray_1;
                debug("Received " + this.getMsgPrefix(code) + " message from " + this._peer._socket.remoteAddress + ":" + this._peer._socket.remotePort + ": : " + (this._peerStatus ? this._getStatusString(this._peerStatus) : ''));
                this._handleStatus();
                break;
            case LES.MESSAGE_CODES.ANNOUNCE:
            case LES.MESSAGE_CODES.GET_BLOCK_HEADERS:
            case LES.MESSAGE_CODES.BLOCK_HEADERS:
            case LES.MESSAGE_CODES.GET_BLOCK_BODIES:
            case LES.MESSAGE_CODES.BLOCK_BODIES:
            case LES.MESSAGE_CODES.GET_RECEIPTS:
            case LES.MESSAGE_CODES.RECEIPTS:
            case LES.MESSAGE_CODES.GET_PROOFS:
            case LES.MESSAGE_CODES.PROOFS:
            case LES.MESSAGE_CODES.GET_CONTRACT_CODES:
            case LES.MESSAGE_CODES.CONTRACT_CODES:
            case LES.MESSAGE_CODES.GET_HEADER_PROOFS:
            case LES.MESSAGE_CODES.HEADER_PROOFS:
            case LES.MESSAGE_CODES.SEND_TX:
            case LES.MESSAGE_CODES.GET_PROOFS_V2:
            case LES.MESSAGE_CODES.PROOFS_V2:
            case LES.MESSAGE_CODES.GET_HELPER_TRIE_PROOFS:
            case LES.MESSAGE_CODES.HELPER_TRIE_PROOFS:
            case LES.MESSAGE_CODES.SEND_TX_V2:
            case LES.MESSAGE_CODES.GET_TX_STATUS:
            case LES.MESSAGE_CODES.TX_STATUS:
                if (this._version >= LES.les2.version)
                    break;
                return;
            default:
                return;
        }
        this.emit('message', code, payload);
    };
    LES.prototype._handleStatus = function () {
        if (this._status === null || this._peerStatus === null)
            return;
        clearTimeout(this._statusTimeoutId);
        util_1.assertEq(this._status['protocolVersion'], this._peerStatus['protocolVersion'], 'Protocol version mismatch');
        util_1.assertEq(this._status['networkId'], this._peerStatus['networkId'], 'NetworkId mismatch');
        util_1.assertEq(this._status['genesisHash'], this._peerStatus['genesisHash'], 'Genesis block mismatch');
        this.emit('status', this._peerStatus);
    };
    LES.prototype.getVersion = function () {
        return this._version;
    };
    LES.prototype._getStatusString = function (status) {
        var sStr = "[V:" + util_1.buffer2int(status['protocolVersion']) + ", ";
        sStr += "NID:" + util_1.buffer2int(status['networkId']) + ", HTD:" + util_1.buffer2int(status['headTd']) + ", ";
        sStr += "HeadH:" + status['headHash'].toString('hex') + ", HeadN:" + util_1.buffer2int(status['headNum']) + ", ";
        sStr += "GenH:" + status['genesisHash'].toString('hex');
        if (status['serveHeaders'])
            sStr += ", serveHeaders active";
        if (status['serveChainSince'])
            sStr += ", ServeCS: " + util_1.buffer2int(status['serveChainSince']);
        if (status['serveStateSince'])
            sStr += ", ServeSS: " + util_1.buffer2int(status['serveStateSince']);
        if (status['txRelax'])
            sStr += ", txRelay active";
        if (status['flowControl/BL'])
            sStr += ", flowControl/BL set";
        if (status['flowControl/MRR'])
            sStr += ", flowControl/MRR set";
        if (status['flowControl/MRC'])
            sStr += ", flowControl/MRC set";
        sStr += "]";
        return sStr;
    };
    LES.prototype.sendStatus = function (status) {
        if (this._status !== null)
            return;
        if (!status.announceType) {
            status['announceType'] = exports.DEFAULT_ANNOUNCE_TYPE;
        }
        status['announceType'] = util_1.int2buffer(status['announceType']);
        status['protocolVersion'] = util_1.int2buffer(this._version);
        status['networkId'] = util_1.int2buffer(status['networkId']);
        this._status = status;
        var statusList = [];
        Object.keys(status).forEach(function (key) {
            statusList.push([key, status[key]]);
        });
        debug("Send STATUS message to " + this._peer._socket.remoteAddress + ":" + this._peer._socket.remotePort + " (les" + this._version + "): " + this._getStatusString(this._status));
        this._send(LES.MESSAGE_CODES.STATUS, rlp_encoding_1.default.encode(statusList));
        this._handleStatus();
    };
    LES.prototype.sendMessage = function (code, reqId, payload) {
        debug("Send " + this.getMsgPrefix(code) + " message to " + this._peer._socket.remoteAddress + ":" + this._peer._socket.remotePort + ": " + rlp_encoding_1.default.encode(payload).toString('hex'));
        switch (code) {
            case LES.MESSAGE_CODES.STATUS:
                throw new Error('Please send status message through .sendStatus');
            case LES.MESSAGE_CODES.ANNOUNCE: // LES/1
            case LES.MESSAGE_CODES.GET_BLOCK_HEADERS:
            case LES.MESSAGE_CODES.BLOCK_HEADERS:
            case LES.MESSAGE_CODES.GET_BLOCK_BODIES:
            case LES.MESSAGE_CODES.BLOCK_BODIES:
            case LES.MESSAGE_CODES.GET_RECEIPTS:
            case LES.MESSAGE_CODES.RECEIPTS:
            case LES.MESSAGE_CODES.GET_PROOFS:
            case LES.MESSAGE_CODES.PROOFS:
            case LES.MESSAGE_CODES.GET_CONTRACT_CODES:
            case LES.MESSAGE_CODES.CONTRACT_CODES:
            case LES.MESSAGE_CODES.GET_HEADER_PROOFS:
            case LES.MESSAGE_CODES.HEADER_PROOFS:
            case LES.MESSAGE_CODES.SEND_TX:
            case LES.MESSAGE_CODES.GET_PROOFS_V2: // LES/2
            case LES.MESSAGE_CODES.PROOFS_V2:
            case LES.MESSAGE_CODES.GET_HELPER_TRIE_PROOFS:
            case LES.MESSAGE_CODES.HELPER_TRIE_PROOFS:
            case LES.MESSAGE_CODES.SEND_TX_V2:
            case LES.MESSAGE_CODES.GET_TX_STATUS:
            case LES.MESSAGE_CODES.TX_STATUS:
                if (this._version >= LES.les2.version)
                    break;
                throw new Error("Code " + code + " not allowed with version " + this._version);
            default:
                throw new Error("Unknown code " + code);
        }
        this._send(code, rlp_encoding_1.default.encode([reqId, payload]));
    };
    LES.prototype.getMsgPrefix = function (msgCode) {
        return LES.MESSAGE_CODES[msgCode];
    };
    LES.les2 = { name: 'les', version: 2, length: 21, constructor: LES };
    return LES;
}(events_1.EventEmitter));
exports.LES = LES;
(function (LES) {
    var MESSAGE_CODES;
    (function (MESSAGE_CODES) {
        // LES/1
        MESSAGE_CODES[MESSAGE_CODES["STATUS"] = 0] = "STATUS";
        MESSAGE_CODES[MESSAGE_CODES["ANNOUNCE"] = 1] = "ANNOUNCE";
        MESSAGE_CODES[MESSAGE_CODES["GET_BLOCK_HEADERS"] = 2] = "GET_BLOCK_HEADERS";
        MESSAGE_CODES[MESSAGE_CODES["BLOCK_HEADERS"] = 3] = "BLOCK_HEADERS";
        MESSAGE_CODES[MESSAGE_CODES["GET_BLOCK_BODIES"] = 4] = "GET_BLOCK_BODIES";
        MESSAGE_CODES[MESSAGE_CODES["BLOCK_BODIES"] = 5] = "BLOCK_BODIES";
        MESSAGE_CODES[MESSAGE_CODES["GET_RECEIPTS"] = 6] = "GET_RECEIPTS";
        MESSAGE_CODES[MESSAGE_CODES["RECEIPTS"] = 7] = "RECEIPTS";
        MESSAGE_CODES[MESSAGE_CODES["GET_PROOFS"] = 8] = "GET_PROOFS";
        MESSAGE_CODES[MESSAGE_CODES["PROOFS"] = 9] = "PROOFS";
        MESSAGE_CODES[MESSAGE_CODES["GET_CONTRACT_CODES"] = 10] = "GET_CONTRACT_CODES";
        MESSAGE_CODES[MESSAGE_CODES["CONTRACT_CODES"] = 11] = "CONTRACT_CODES";
        MESSAGE_CODES[MESSAGE_CODES["GET_HEADER_PROOFS"] = 13] = "GET_HEADER_PROOFS";
        MESSAGE_CODES[MESSAGE_CODES["HEADER_PROOFS"] = 14] = "HEADER_PROOFS";
        MESSAGE_CODES[MESSAGE_CODES["SEND_TX"] = 12] = "SEND_TX";
        // LES/2
        MESSAGE_CODES[MESSAGE_CODES["GET_PROOFS_V2"] = 15] = "GET_PROOFS_V2";
        MESSAGE_CODES[MESSAGE_CODES["PROOFS_V2"] = 16] = "PROOFS_V2";
        MESSAGE_CODES[MESSAGE_CODES["GET_HELPER_TRIE_PROOFS"] = 17] = "GET_HELPER_TRIE_PROOFS";
        MESSAGE_CODES[MESSAGE_CODES["HELPER_TRIE_PROOFS"] = 18] = "HELPER_TRIE_PROOFS";
        MESSAGE_CODES[MESSAGE_CODES["SEND_TX_V2"] = 19] = "SEND_TX_V2";
        MESSAGE_CODES[MESSAGE_CODES["GET_TX_STATUS"] = 20] = "GET_TX_STATUS";
        MESSAGE_CODES[MESSAGE_CODES["TX_STATUS"] = 21] = "TX_STATUS";
    })(MESSAGE_CODES = LES.MESSAGE_CODES || (LES.MESSAGE_CODES = {}));
})(LES = exports.LES || (exports.LES = {}));
exports.LES = LES;
//# sourceMappingURL=index.js.map
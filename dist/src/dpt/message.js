"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ip_1 = __importDefault(require("ip"));
var rlp_encoding_1 = __importDefault(require("rlp-encoding"));
var secp256k1_1 = __importDefault(require("secp256k1"));
var util_1 = require("../util");
function getTimestamp() {
    return (Date.now() / 1000) | 0;
}
var timestamp = {
    encode: function (value) {
        if (value === void 0) { value = getTimestamp() + 60; }
        var buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32BE(value, 0);
        return buffer;
    },
    decode: function (buffer) {
        if (buffer.length !== 4)
            throw new RangeError("Invalid timestamp buffer :" + buffer.toString('hex'));
        return buffer.readUInt32BE(0);
    },
};
var address = {
    encode: function (value) {
        if (ip_1.default.isV4Format(value))
            return ip_1.default.toBuffer(value);
        if (ip_1.default.isV6Format(value))
            return ip_1.default.toBuffer(value);
        throw new Error("Invalid address: " + value);
    },
    decode: function (buffer) {
        if (buffer.length === 4)
            return ip_1.default.toString(buffer);
        if (buffer.length === 16)
            return ip_1.default.toString(buffer);
        var str = buffer.toString();
        if (ip_1.default.isV4Format(str) || ip_1.default.isV6Format(str))
            return str;
        // also can be host, but skip it right now (because need async function for resolve)
        throw new Error("Invalid address buffer: " + buffer.toString('hex'));
    },
};
var port = {
    encode: function (value) {
        if (value === null)
            return Buffer.allocUnsafe(0);
        if (value >>> 16 > 0)
            throw new RangeError("Invalid port: " + value);
        return Buffer.from([(value >>> 8) & 0xff, (value >>> 0) & 0xff]);
    },
    decode: function (buffer) {
        if (buffer.length === 0)
            return null;
        // if (buffer.length !== 2) throw new RangeError(`Invalid port buffer: ${buffer.toString('hex')}`)
        return util_1.buffer2int(buffer);
    },
};
var endpoint = {
    encode: function (obj) {
        return [
            address.encode(obj.address),
            port.encode(obj.udpPort || null),
            port.encode(obj.tcpPort || null),
        ];
    },
    decode: function (payload) {
        return {
            address: address.decode(payload[0]),
            udpPort: port.decode(payload[1]),
            tcpPort: port.decode(payload[2]),
        };
    },
};
var ping = {
    encode: function (obj) {
        return [
            util_1.int2buffer(obj.version),
            endpoint.encode(obj.from),
            endpoint.encode(obj.to),
            timestamp.encode(obj.timestamp),
        ];
    },
    decode: function (payload) {
        return {
            version: util_1.buffer2int(payload[0]),
            from: endpoint.decode(payload[1]),
            to: endpoint.decode(payload[2]),
            timestamp: timestamp.decode(payload[3]),
        };
    },
};
var pong = {
    encode: function (obj) {
        return [endpoint.encode(obj.to), obj.hash, timestamp.encode(obj.timestamp)];
    },
    decode: function (payload) {
        return {
            to: endpoint.decode(payload[0]),
            hash: payload[1],
            timestamp: timestamp.decode(payload[2]),
        };
    },
};
var findneighbours = {
    encode: function (obj) {
        return [obj.id, timestamp.encode(obj.timestamp)];
    },
    decode: function (payload) {
        return {
            id: payload[0],
            timestamp: timestamp.decode(payload[1]),
        };
    },
};
var neighbours = {
    encode: function (obj) {
        return [
            obj.peers.map(function (peer) { return endpoint.encode(peer).concat(peer.id); }),
            timestamp.encode(obj.timestamp),
        ];
    },
    decode: function (payload) {
        return {
            peers: payload[0].map(function (data) {
                return { endpoint: endpoint.decode(data), id: data[3] }; // hack for id
            }),
            timestamp: timestamp.decode(payload[1]),
        };
    },
};
var messages = { ping: ping, pong: pong, findneighbours: findneighbours, neighbours: neighbours };
var types = {
    byName: {
        ping: 0x01,
        pong: 0x02,
        findneighbours: 0x03,
        neighbours: 0x04,
    },
    byType: {
        0x01: 'ping',
        0x02: 'pong',
        0x03: 'findneighbours',
        0x04: 'neighbours',
    },
};
// [0, 32) data hash
// [32, 96) signature
// 96 recoveryId
// 97 type
// [98, length) data
function encode(typename, data, privateKey) {
    var type = types.byName[typename];
    if (type === undefined)
        throw new Error("Invalid typename: " + typename);
    var encodedMsg = messages[typename].encode(data);
    var typedata = Buffer.concat([Buffer.from([type]), rlp_encoding_1.default.encode(encodedMsg)]);
    var sighash = util_1.keccak256(typedata);
    var sig = secp256k1_1.default.sign(sighash, privateKey);
    var hashdata = Buffer.concat([sig.signature, Buffer.from([sig.recovery]), typedata]);
    var hash = util_1.keccak256(hashdata);
    return Buffer.concat([hash, hashdata]);
}
exports.encode = encode;
function decode(buffer) {
    var hash = util_1.keccak256(buffer.slice(32));
    util_1.assertEq(buffer.slice(0, 32), hash, 'Hash verification failed');
    var typedata = buffer.slice(97);
    var type = typedata[0];
    var typename = types.byType[type];
    if (typename === undefined)
        throw new Error("Invalid type: " + type);
    var data = messages[typename].decode(rlp_encoding_1.default.decode(typedata.slice(1)));
    var sighash = util_1.keccak256(typedata);
    var signature = buffer.slice(32, 96);
    var recoverId = buffer[96];
    var publicKey = secp256k1_1.default.recover(sighash, signature, recoverId, false);
    return { typename: typename, data: data, publicKey: publicKey };
}
exports.decode = decode;
//# sourceMappingURL=message.js.map
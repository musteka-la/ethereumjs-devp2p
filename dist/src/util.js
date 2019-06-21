"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var secp256k1_1 = require("secp256k1");
var debug_1 = require("debug");
var keccak_1 = __importDefault(require("keccak"));
var assert_1 = __importDefault(require("assert"));
var debug = debug_1.debug('devp2p:util');
function keccak256() {
    var buffers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        buffers[_i] = arguments[_i];
    }
    var buffer = Buffer.concat(buffers);
    return keccak_1.default('keccak256')
        .update(buffer)
        .digest();
}
exports.keccak256 = keccak256;
function genPrivateKey() {
    while (true) {
        var privateKey = crypto_1.randomBytes(32);
        if (secp256k1_1.privateKeyVerify(privateKey))
            return privateKey;
    }
}
exports.genPrivateKey = genPrivateKey;
function pk2id(pk) {
    if (pk.length === 33)
        pk = secp256k1_1.publicKeyConvert(pk, false);
    return pk.slice(1);
}
exports.pk2id = pk2id;
function id2pk(id) {
    return Buffer.concat([Buffer.from([0x04]), id]);
}
exports.id2pk = id2pk;
function int2buffer(v) {
    var hex = v.toString(16);
    if (hex.length % 2 === 1)
        hex = '0' + hex;
    return Buffer.from(hex, 'hex');
}
exports.int2buffer = int2buffer;
function buffer2int(buffer) {
    if (buffer.length === 0)
        return NaN;
    var n = 0;
    for (var i = 0; i < buffer.length; ++i)
        n = n * 256 + buffer[i];
    return n;
}
exports.buffer2int = buffer2int;
function zfill(buffer, size, leftpad) {
    if (leftpad === void 0) { leftpad = true; }
    if (buffer.length >= size)
        return buffer;
    if (leftpad === undefined)
        leftpad = true;
    var pad = Buffer.allocUnsafe(size - buffer.length).fill(0x00);
    return leftpad ? Buffer.concat([pad, buffer]) : Buffer.concat([buffer, pad]);
}
exports.zfill = zfill;
function xor(a, b) {
    var length = Math.min(a.length, b.length);
    var buffer = Buffer.allocUnsafe(length);
    for (var i = 0; i < length; ++i)
        buffer[i] = a[i] ^ b[i];
    return buffer;
}
exports.xor = xor;
function assertEq(expected, actual, msg) {
    var message;
    if (Buffer.isBuffer(expected) && Buffer.isBuffer(actual)) {
        if (expected.equals(actual))
            return;
        message = msg + ": " + expected.toString('hex') + " / " + actual.toString('hex');
        debug(message);
        throw new assert_1.default.AssertionError({
            message: message,
        });
    }
    if (expected === actual)
        return;
    message = msg + ": " + expected + " / " + actual;
    debug(message);
    throw new assert_1.default.AssertionError({
        message: message,
    });
}
exports.assertEq = assertEq;
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this = this;
        this.resolve = function () { };
        this.reject = function () { };
        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    }
    return Deferred;
}());
exports.Deferred = Deferred;
function createDeferred() {
    return new Deferred();
}
exports.createDeferred = createDeferred;
//# sourceMappingURL=util.js.map
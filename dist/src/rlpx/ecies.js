"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var secp256k1_1 = require("secp256k1");
var rlp_encoding_1 = __importDefault(require("rlp-encoding"));
var mac_1 = require("./mac");
var util_1 = require("../util");
function ecdhX(publicKey, privateKey) {
    // return (publicKey * privateKey).x
    return secp256k1_1.ecdhUnsafe(publicKey, privateKey, true).slice(1);
}
// a straigth rip from python interop w/go ecies implementation
// for sha3, blocksize is 136 bytes
// for sha256, blocksize is 64 bytes
// NIST SP 800-56a Concatenation Key Derivation Function (see section 5.8.1).
// https://github.com/ethereum/pydevp2p/blob/master/devp2p/crypto.py#L295
// https://github.com/ethereum/go-ethereum/blob/fe532a98f9f32bb81ef0d8d013cf44327830d11e/crypto/ecies/ecies.go#L165
// https://github.com/ethereum/cpp-ethereum/blob/develop/libdevcrypto/CryptoPP.cpp#L36
function concatKDF(keyMaterial, keyLength) {
    var SHA256BlockSize = 64;
    var reps = ((keyLength + 7) * 8) / (SHA256BlockSize * 8);
    var buffers = [];
    for (var counter = 0, tmp = Buffer.allocUnsafe(4); counter <= reps;) {
        counter += 1;
        tmp.writeUInt32BE(counter, 0);
        buffers.push(crypto_1.default
            .createHash('sha256')
            .update(tmp)
            .update(keyMaterial)
            .digest());
    }
    return Buffer.concat(buffers).slice(0, keyLength);
}
var ECIES = /** @class */ (function () {
    function ECIES(privateKey, id, remoteId) {
        this._remoteNonce = null;
        this._initMsg = null;
        this._remoteInitMsg = null;
        this._gotEIP8Auth = false;
        this._gotEIP8Ack = false;
        this._ingressAes = null;
        this._egressAes = null;
        this._ingressMac = null;
        this._egressMac = null;
        this._remoteEphemeralPublicKey = null; // we don't need store this key, but why don't?
        this._ephemeralSharedSecret = null;
        this._bodySize = null;
        this._privateKey = privateKey;
        this._publicKey = util_1.id2pk(id);
        this._remotePublicKey = remoteId ? util_1.id2pk(remoteId) : null;
        this._nonce = crypto_1.default.randomBytes(32);
        this._ephemeralPrivateKey = util_1.genPrivateKey();
        this._ephemeralPublicKey = secp256k1_1.publicKeyCreate(this._ephemeralPrivateKey, false);
    }
    ECIES.prototype._encryptMessage = function (data, sharedMacData) {
        if (sharedMacData === void 0) { sharedMacData = null; }
        var privateKey = util_1.genPrivateKey();
        if (!this._remotePublicKey)
            return;
        var x = ecdhX(this._remotePublicKey, privateKey);
        var key = concatKDF(x, 32);
        var ekey = key.slice(0, 16); // encryption key
        var mkey = crypto_1.default
            .createHash('sha256')
            .update(key.slice(16, 32))
            .digest(); // MAC key
        // encrypt
        var IV = crypto_1.default.randomBytes(16);
        var cipher = crypto_1.default.createCipheriv('aes-128-ctr', ekey, IV);
        var encryptedData = cipher.update(data);
        var dataIV = Buffer.concat([IV, encryptedData]);
        // create tag
        if (!sharedMacData) {
            sharedMacData = Buffer.from([]);
        }
        var tag = crypto_1.default
            .createHmac('sha256', mkey)
            .update(Buffer.concat([dataIV, sharedMacData]))
            .digest();
        var publicKey = secp256k1_1.publicKeyCreate(privateKey, false);
        return Buffer.concat([publicKey, dataIV, tag]);
    };
    ECIES.prototype._decryptMessage = function (data, sharedMacData) {
        if (sharedMacData === void 0) { sharedMacData = null; }
        util_1.assertEq(data.slice(0, 1), Buffer.from('04', 'hex'), 'wrong ecies header (possible cause: EIP8 upgrade)');
        var publicKey = data.slice(0, 65);
        var dataIV = data.slice(65, -32);
        var tag = data.slice(-32);
        // derive keys
        var x = ecdhX(publicKey, this._privateKey);
        var key = concatKDF(x, 32);
        var ekey = key.slice(0, 16); // encryption key
        var mkey = crypto_1.default
            .createHash('sha256')
            .update(key.slice(16, 32))
            .digest(); // MAC key
        // check the tag
        if (!sharedMacData) {
            sharedMacData = Buffer.from([]);
        }
        var _tag = crypto_1.default
            .createHmac('sha256', mkey)
            .update(Buffer.concat([dataIV, sharedMacData]))
            .digest();
        util_1.assertEq(_tag, tag, 'should have valid tag');
        // decrypt data
        var IV = dataIV.slice(0, 16);
        var encryptedData = dataIV.slice(16);
        var decipher = crypto_1.default.createDecipheriv('aes-128-ctr', ekey, IV);
        return decipher.update(encryptedData);
    };
    ECIES.prototype._setupFrame = function (remoteData, incoming) {
        if (!this._remoteNonce)
            return;
        var nonceMaterial = incoming
            ? Buffer.concat([this._nonce, this._remoteNonce])
            : Buffer.concat([this._remoteNonce, this._nonce]);
        var hNonce = util_1.keccak256(nonceMaterial);
        if (!this._ephemeralSharedSecret)
            return;
        var IV = Buffer.allocUnsafe(16).fill(0x00);
        var sharedSecret = util_1.keccak256(this._ephemeralSharedSecret, hNonce);
        var aesSecret = util_1.keccak256(this._ephemeralSharedSecret, sharedSecret);
        this._ingressAes = crypto_1.default.createDecipheriv('aes-256-ctr', aesSecret, IV);
        this._egressAes = crypto_1.default.createDecipheriv('aes-256-ctr', aesSecret, IV);
        var macSecret = util_1.keccak256(this._ephemeralSharedSecret, aesSecret);
        this._ingressMac = new mac_1.MAC(macSecret);
        this._ingressMac.update(Buffer.concat([util_1.xor(macSecret, this._nonce), remoteData]));
        this._egressMac = new mac_1.MAC(macSecret);
        if (!this._initMsg)
            return;
        this._egressMac.update(Buffer.concat([util_1.xor(macSecret, this._remoteNonce), this._initMsg]));
    };
    ECIES.prototype.createAuthEIP8 = function () {
        if (!this._remotePublicKey)
            return;
        var x = ecdhX(this._remotePublicKey, this._privateKey);
        var sig = secp256k1_1.sign(util_1.xor(x, this._nonce), this._ephemeralPrivateKey);
        var data = [
            Buffer.concat([sig.signature, Buffer.from([sig.recovery])]),
            // keccak256(pk2id(this._ephemeralPublicKey)),
            util_1.pk2id(this._publicKey),
            this._nonce,
            Buffer.from([0x04]),
        ];
        var dataRLP = rlp_encoding_1.default.encode(data);
        var pad = crypto_1.default.randomBytes(100 + Math.floor(Math.random() * 151)); // Random padding between 100, 250
        var authMsg = Buffer.concat([dataRLP, pad]);
        var overheadLength = 113;
        var sharedMacData = util_1.int2buffer(authMsg.length + overheadLength);
        var encryptedMsg = this._encryptMessage(authMsg, sharedMacData);
        if (!encryptedMsg)
            return;
        this._initMsg = Buffer.concat([sharedMacData, encryptedMsg]);
        return this._initMsg;
    };
    ECIES.prototype.createAuthNonEIP8 = function () {
        if (!this._remotePublicKey)
            return;
        var x = ecdhX(this._remotePublicKey, this._privateKey);
        var sig = secp256k1_1.sign(util_1.xor(x, this._nonce), this._ephemeralPrivateKey);
        var data = Buffer.concat([
            sig.signature,
            Buffer.from([sig.recovery]),
            util_1.keccak256(util_1.pk2id(this._ephemeralPublicKey)),
            util_1.pk2id(this._publicKey),
            this._nonce,
            Buffer.from([0x00]),
        ]);
        this._initMsg = this._encryptMessage(data);
        return this._initMsg;
    };
    ECIES.prototype.parseAuthPlain = function (data, sharedMacData) {
        if (sharedMacData === void 0) { sharedMacData = null; }
        var prefix = sharedMacData !== null ? sharedMacData : Buffer.from([]);
        this._remoteInitMsg = Buffer.concat([prefix, data]);
        var decrypted = this._decryptMessage(data, sharedMacData);
        var signature = null;
        var recoveryId = null;
        var heid = null;
        var remotePublicKey = null;
        var nonce = null;
        if (!this._gotEIP8Auth) {
            util_1.assertEq(decrypted.length, 194, 'invalid packet length');
            signature = decrypted.slice(0, 64);
            recoveryId = decrypted[64];
            heid = decrypted.slice(65, 97); // 32 bytes
            remotePublicKey = util_1.id2pk(decrypted.slice(97, 161));
            nonce = decrypted.slice(161, 193);
        }
        else {
            var decoded = rlp_encoding_1.default.decode(decrypted);
            signature = decoded[0].slice(0, 64);
            recoveryId = decoded[0][64];
            remotePublicKey = util_1.id2pk(decoded[1]);
            nonce = decoded[2];
        }
        // parse packet
        this._remotePublicKey = remotePublicKey; // 64 bytes
        this._remoteNonce = nonce; // 32 bytes
        // assertEq(decrypted[193], 0, 'invalid postfix')
        var x = ecdhX(this._remotePublicKey, this._privateKey);
        if (!this._remoteNonce)
            return;
        this._remoteEphemeralPublicKey = secp256k1_1.recover(util_1.xor(x, this._remoteNonce), signature, recoveryId, false);
        if (!this._remoteEphemeralPublicKey)
            return;
        this._ephemeralSharedSecret = ecdhX(this._remoteEphemeralPublicKey, this._ephemeralPrivateKey);
        if (heid !== null && this._remoteEphemeralPublicKey) {
            util_1.assertEq(util_1.keccak256(util_1.pk2id(this._remoteEphemeralPublicKey)), heid, 'the hash of the ephemeral key should match');
        }
    };
    ECIES.prototype.parseAuthEIP8 = function (data) {
        var size = util_1.buffer2int(data.slice(0, 2)) + 2;
        util_1.assertEq(data.length, size, 'message length different from specified size (EIP8)');
        this.parseAuthPlain(data.slice(2), data.slice(0, 2));
    };
    ECIES.prototype.createAckEIP8 = function () {
        var data = [util_1.pk2id(this._ephemeralPublicKey), this._nonce, Buffer.from([0x04])];
        var dataRLP = rlp_encoding_1.default.encode(data);
        var pad = crypto_1.default.randomBytes(100 + Math.floor(Math.random() * 151)); // Random padding between 100, 250
        var ackMsg = Buffer.concat([dataRLP, pad]);
        var overheadLength = 113;
        var sharedMacData = util_1.int2buffer(ackMsg.length + overheadLength);
        var encryptedMsg = this._encryptMessage(ackMsg, sharedMacData);
        if (!encryptedMsg)
            return;
        this._initMsg = Buffer.concat([sharedMacData, encryptedMsg]);
        if (!this._remoteInitMsg)
            return;
        this._setupFrame(this._remoteInitMsg, true);
        return this._initMsg;
    };
    ECIES.prototype.createAckOld = function () {
        var data = Buffer.concat([util_1.pk2id(this._ephemeralPublicKey), this._nonce, Buffer.from([0x00])]);
        this._initMsg = this._encryptMessage(data);
        if (!this._remoteInitMsg)
            return;
        this._setupFrame(this._remoteInitMsg, true);
        return this._initMsg;
    };
    ECIES.prototype.parseAckPlain = function (data, sharedMacData) {
        if (sharedMacData === void 0) { sharedMacData = null; }
        var decrypted = this._decryptMessage(data, sharedMacData);
        var remoteEphemeralPublicKey = null;
        var remoteNonce = null;
        if (!this._gotEIP8Ack) {
            util_1.assertEq(decrypted.length, 97, 'invalid packet length');
            util_1.assertEq(decrypted[96], 0, 'invalid postfix');
            remoteEphemeralPublicKey = util_1.id2pk(decrypted.slice(0, 64));
            remoteNonce = decrypted.slice(64, 96);
        }
        else {
            var decoded = rlp_encoding_1.default.decode(decrypted);
            remoteEphemeralPublicKey = util_1.id2pk(decoded[0]);
            remoteNonce = decoded[1];
        }
        // parse packet
        this._remoteEphemeralPublicKey = remoteEphemeralPublicKey;
        this._remoteNonce = remoteNonce;
        this._ephemeralSharedSecret = ecdhX(this._remoteEphemeralPublicKey, this._ephemeralPrivateKey);
        if (!sharedMacData) {
            sharedMacData = Buffer.from([]);
        }
        this._setupFrame(Buffer.concat([sharedMacData, data]), false);
    };
    ECIES.prototype.parseAckEIP8 = function (data) {
        // eslint-disable-line
        var size = util_1.buffer2int(data.slice(0, 2)) + 2;
        util_1.assertEq(data.length, size, 'message length different from specified size (EIP8)');
        this.parseAckPlain(data.slice(2), data.slice(0, 2));
    };
    ECIES.prototype.createHeader = function (size) {
        var bufSize = util_1.zfill(util_1.int2buffer(size), 3);
        var header = Buffer.concat([bufSize, rlp_encoding_1.default.encode([0, 0])]); // TODO: the rlp will contain something else someday
        header = util_1.zfill(header, 16, false);
        if (!this._egressAes)
            return;
        header = this._egressAes.update(header);
        if (!this._egressMac)
            return;
        this._egressMac.updateHeader(header);
        var tag = this._egressMac.digest();
        return Buffer.concat([header, tag]);
    };
    ECIES.prototype.parseHeader = function (data) {
        // parse header
        var header = data.slice(0, 16);
        var mac = data.slice(16, 32);
        if (!this._ingressMac)
            return;
        this._ingressMac.updateHeader(header);
        var _mac = this._ingressMac.digest();
        util_1.assertEq(_mac, mac, 'Invalid MAC');
        if (!this._ingressAes)
            return;
        header = this._ingressAes.update(header);
        this._bodySize = util_1.buffer2int(header.slice(0, 3));
        return this._bodySize;
    };
    ECIES.prototype.createBody = function (data) {
        data = util_1.zfill(data, Math.ceil(data.length / 16) * 16, false);
        if (!this._egressAes)
            return;
        var encryptedData = this._egressAes.update(data);
        if (!this._egressMac)
            return;
        this._egressMac.updateBody(encryptedData);
        var tag = this._egressMac.digest();
        return Buffer.concat([encryptedData, tag]);
    };
    ECIES.prototype.parseBody = function (data) {
        if (this._bodySize === null)
            throw new Error('need to parse header first');
        var body = data.slice(0, -16);
        var mac = data.slice(-16);
        if (!this._ingressMac)
            return;
        this._ingressMac.updateBody(body);
        var _mac = this._ingressMac.digest();
        util_1.assertEq(_mac, mac, 'Invalid MAC');
        var size = this._bodySize;
        this._bodySize = null;
        if (!this._ingressAes)
            return;
        return this._ingressAes.update(body).slice(0, size);
    };
    return ECIES;
}());
exports.ECIES = ECIES;
//# sourceMappingURL=ecies.js.map
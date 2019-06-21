"use strict";
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
var crypto_1 = require("crypto");
var secp256k1 = __importStar(require("secp256k1"));
var tape_1 = __importDefault(require("tape"));
var util = __importStar(require("../src/util"));
var ecies_1 = require("../src/rlpx/ecies");
var testdata_json_1 = __importDefault(require("./testdata.json"));
function randomBefore(fn) {
    return function (t) {
        var privateKey1 = util.genPrivateKey();
        var privateKey2 = util.genPrivateKey();
        var publicKey1 = secp256k1.publicKeyCreate(privateKey1, false);
        var publicKey2 = secp256k1.publicKeyCreate(privateKey2, false);
        t.context = {
            a: new ecies_1.ECIES(privateKey1, util.pk2id(publicKey1), util.pk2id(publicKey2)),
            b: new ecies_1.ECIES(privateKey2, util.pk2id(publicKey2), util.pk2id(publicKey1)),
        };
        fn(t);
    };
}
function testdataBefore(fn) {
    return function (t) {
        var v = testdata_json_1.default.eip8Values;
        var keyA = Buffer.from(v.keyA, 'hex');
        var keyB = Buffer.from(v.keyB, 'hex');
        var pubA = Buffer.from(v.pubA, 'hex');
        var pubB = Buffer.from(v.pubB, 'hex');
        var h = testdata_json_1.default.eip8Handshakes;
        t.context = {
            a: new ecies_1.ECIES(keyA, util.pk2id(pubA), util.pk2id(pubB)),
            b: new ecies_1.ECIES(keyB, util.pk2id(pubB), util.pk2id(pubA)),
            h0: {
                auth: Buffer.from(h[0].auth.join(''), 'hex'),
                ack: Buffer.from(h[0].ack.join(''), 'hex'),
            },
            h1: {
                auth: Buffer.from(h[1].auth.join(''), 'hex'),
                ack: Buffer.from(h[1].ack.join(''), 'hex'),
            },
        };
        fn(t);
    };
}
tape_1.default('Random: message encryption', randomBefore(function (t) {
    var message = Buffer.from('The Magic Words are Squeamish Ossifrage');
    var encrypted = t.context.a._encryptMessage(message);
    var decrypted = t.context.b._decryptMessage(encrypted);
    t.same(message, decrypted, 'encryptMessage -> decryptMessage should lead to same');
    t.end();
}));
tape_1.default('Random: auth -> ack -> header -> body (old format/no EIP8)', randomBefore(function (t) {
    t.doesNotThrow(function () {
        var auth = t.context.a.createAuthNonEIP8();
        t.context.b._gotEIP8Auth = false;
        t.context.b.parseAuthPlain(auth);
    }, 'should not throw on auth creation/parsing');
    t.doesNotThrow(function () {
        t.context.b._gotEIP8Ack = false;
        var ack = t.context.b.createAckOld();
        t.context.a.parseAckPlain(ack);
    }, 'should not throw on ack creation/parsing');
    var body = crypto_1.randomBytes(600);
    var header = t.context.b.parseHeader(t.context.a.createHeader(body.length));
    t.same(header, body.length, 'createHeader -> parseHeader should lead to same');
    var parsedBody = t.context.b.parseBody(t.context.a.createBody(body));
    t.same(parsedBody, body, 'createBody -> parseBody should lead to same');
    t.end();
}));
tape_1.default('Random: auth -> ack (EIP8)', randomBefore(function (t) {
    t.doesNotThrow(function () {
        var auth = t.context.a.createAuthEIP8();
        t.context.b._gotEIP8Auth = true;
        t.context.b.parseAuthEIP8(auth);
    }, 'should not throw on auth creation/parsing');
    t.doesNotThrow(function () {
        var ack = t.context.b.createAckEIP8();
        t.context.a._gotEIP8Ack = true;
        t.context.a.parseAckEIP8(ack);
    }, 'should not throw on ack creation/parsing');
    t.end();
}));
tape_1.default('Testdata: auth -> ack (old format/no EIP8)', testdataBefore(function (t) {
    t.doesNotThrow(function () {
        t.context.b._gotEIP8Auth = false;
        t.context.b.parseAuthPlain(t.context.h0.auth);
        t.context.a._initMsg = t.context.h0.auth;
    }, 'should not throw on auth parsing');
    t.doesNotThrow(function () {
        t.context.a._gotEIP8Ack = false;
        t.context.a.parseAckPlain(t.context.h0.ack);
    }, 'should not throw on ack parsing');
    t.end();
}));
tape_1.default('Testdata: auth -> ack (EIP8)', testdataBefore(function (t) {
    t.doesNotThrow(function () {
        t.context.b._gotEIP8Auth = true;
        t.context.b.parseAuthEIP8(t.context.h1.auth);
        t.context.a._initMsg = t.context.h1.auth;
    }, 'should not throw on auth parsing');
    t.doesNotThrow(function () {
        t.context.a._gotEIP8Ack = true;
        t.context.a.parseAckEIP8(t.context.h1.ack);
    }, 'should not throw on ack parsing');
    t.end();
}));
//# sourceMappingURL=rlpx-ecies.js.map
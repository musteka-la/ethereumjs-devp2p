"use strict";
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var async_1 = __importDefault(require("async"));
var tape_1 = __importDefault(require("tape"));
var util = __importStar(require("./util"));
var peer_1 = require("../../src/rlpx/peer");
tape_1.default('RLPX: add working node', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var rlpxs;
    return __generator(this, function (_a) {
        rlpxs = util.initTwoPeerRLPXSetup(null, null);
        rlpxs[0].on('peer:added', function (peer) {
            t.equal(peer._port, 30306, 'should have added peer on peer:added after successful handshake');
            t.equal(rlpxs[0].getPeers().length, 1, 'peer list length should be 1');
            t.equal(rlpxs[0]._getOpenSlots(), 9, 'should have maxPeers - 1 open slots left');
            util.destroyRLPXs(rlpxs);
            t.end();
        });
        return [2 /*return*/];
    });
}); });
tape_1.default('RLPX: ban node with missing tcp port', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var rlpxs;
    return __generator(this, function (_a) {
        rlpxs = util.initTwoPeerRLPXSetup(null, null);
        rlpxs[0].on('peer:added', function () {
            var peer = {
                id: Buffer.from('abcd', 'hex'),
                address: '127.0.0.1',
                udpPort: 30308,
                tcpPort: null,
            };
            t.notOk(rlpxs[0]._dpt.banlist.has(peer), 'should not be in ban list before bad peer discovered');
            rlpxs[0]._dpt.emit('peer:new', peer);
            t.ok(rlpxs[0]._dpt.banlist.has(peer), 'should be in ban list after bad peer discovered');
            util.destroyRLPXs(rlpxs);
            t.end();
        });
        return [2 /*return*/];
    });
}); });
tape_1.default('RLPX: remove node', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var rlpxs;
    return __generator(this, function (_a) {
        rlpxs = util.initTwoPeerRLPXSetup(null, null);
        async_1.default.series([
            function (cb) {
                rlpxs[0].on('peer:added', function (peer) {
                    rlpxs[0].disconnect(peer._remoteId);
                    cb(null);
                });
            },
            function (cb) {
                rlpxs[0].on('peer:removed', function (peer, reason) {
                    t.equal(reason, peer_1.DISCONNECT_REASONS.CLIENT_QUITTING, 'should close with CLIENT_QUITTING disconnect reason');
                    t.equal(rlpxs[0]._getOpenSlots(), 10, 'should have maxPeers open slots left');
                    cb(null);
                });
            },
        ], function (err) {
            if (err) {
                t.fail('An unexpected error occured.');
            }
            util.destroyRLPXs(rlpxs);
            t.end();
        });
        return [2 /*return*/];
    });
}); });
tape_1.default('RLPX: test peer queue / refill connections', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var rlpxs, peer;
    return __generator(this, function (_a) {
        rlpxs = util.getTestRLPXs(3, 1, null);
        peer = { address: util.localhost, udpPort: util.basePort + 1, tcpPort: util.basePort + 1 };
        rlpxs[0]._dpt.addPeer(peer);
        async_1.default.series([
            function (cb) {
                rlpxs[0].once('peer:added', function () {
                    t.equal(rlpxs[0]._peersQueue.length, 0, 'peers queue should contain no peers');
                    var peer2 = {
                        address: util.localhost,
                        udpPort: util.basePort + 2,
                        tcpPort: util.basePort + 2,
                    };
                    rlpxs[0]._dpt.addPeer(peer2);
                    cb(null);
                });
            },
            function (cb) {
                rlpxs[0].once('peer:added', function () {
                    // FIXME: values not as expected
                    // t.equal(rlpxs[0]._peersQueue.length, 1, 'peers queue should contain one peer')
                    cb(null);
                });
            },
        ], function (err) {
            if (err) {
                t.fail('An unexpected error occured.');
            }
            util.destroyRLPXs(rlpxs);
            t.end();
        });
        return [2 /*return*/];
    });
}); });
//# sourceMappingURL=rlpx-simulator.js.map
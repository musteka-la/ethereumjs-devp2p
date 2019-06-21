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
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../../src");
exports.localhost = '127.0.0.1';
exports.basePort = 30306;
function getTestDPTs(numDPTs) {
    var dpts = [];
    for (var i = 0; i < numDPTs; ++i) {
        var dpt = new src_1.DPT(src_1.genPrivateKey(), {
            endpoint: {
                address: exports.localhost,
                udpPort: exports.basePort + i,
                tcpPort: exports.basePort + i,
            },
            timeout: 100,
        });
        dpt.bind(exports.basePort + i);
        dpts.push(dpt);
    }
    return dpts;
}
exports.getTestDPTs = getTestDPTs;
function initTwoPeerDPTSetup() {
    var dpts = getTestDPTs(2);
    var peer = { address: exports.localhost, udpPort: exports.basePort + 1 };
    dpts[0].addPeer(peer);
    return dpts;
}
exports.initTwoPeerDPTSetup = initTwoPeerDPTSetup;
function destroyDPTs(dpts) {
    var e_1, _a;
    try {
        for (var dpts_1 = __values(dpts), dpts_1_1 = dpts_1.next(); !dpts_1_1.done; dpts_1_1 = dpts_1.next()) {
            var dpt = dpts_1_1.value;
            dpt.destroy();
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (dpts_1_1 && !dpts_1_1.done && (_a = dpts_1.return)) _a.call(dpts_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.destroyDPTs = destroyDPTs;
function getTestRLPXs(numRLPXs, maxPeers, capabilities) {
    var rlpxs = [];
    if (!capabilities) {
        capabilities = [src_1.ETH.eth63, src_1.ETH.eth62];
    }
    var dpts = getTestDPTs(numRLPXs);
    for (var i = 0; i < numRLPXs; ++i) {
        var rlpx = new src_1.RLPx(dpts[i].privateKey, {
            dpt: dpts[i],
            maxPeers: maxPeers,
            capabilities: capabilities,
            listenPort: exports.basePort + i,
        });
        rlpx.listen(exports.basePort + i);
        rlpxs.push(rlpx);
    }
    return rlpxs;
}
exports.getTestRLPXs = getTestRLPXs;
function initTwoPeerRLPXSetup(maxPeers, capabilities) {
    var rlpxs = getTestRLPXs(2, maxPeers, capabilities);
    var peer = { address: exports.localhost, udpPort: exports.basePort + 1, tcpPort: exports.basePort + 1 };
    rlpxs[0]._dpt.addPeer(peer);
    return rlpxs;
}
exports.initTwoPeerRLPXSetup = initTwoPeerRLPXSetup;
/**
 * @param {Test} t
 * @param {Array} capabilities Capabilities
 * @param {Object} opts
 * @param {Dictionary} opts.status0 Status values requested by protocol
 * @param {Dictionary} opts.status1 Status values requested by protocol
 * @param {Function} opts.onOnceStatus0 (rlpxs, protocol) Optional handler function
 * @param {Function} opts.onPeerError0 (err, rlpxs) Optional handler function
 * @param {Function} opts.onPeerError1 (err, rlpxs) Optional handler function
 * @param {Function} opts.onOnMsg0 (rlpxs, protocol, code, payload) Optional handler function
 * @param {Function} opts.onOnMsg1 (rlpxs, protocol, code, payload) Optional handler function
 */
function twoPeerMsgExchange(t, capabilities, opts) {
    var rlpxs = initTwoPeerRLPXSetup(null, capabilities);
    rlpxs[0].on('peer:added', function (peer) {
        var _this = this;
        var protocol = peer.getProtocols()[0];
        protocol.sendStatus(opts.status0); // (1 ->)
        protocol.once('status', function () {
            if (opts.onOnceStatus0)
                opts.onOnceStatus0(rlpxs, protocol);
        }); // (-> 2)
        protocol.on('message', function (code, payload) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (opts.onOnMsg0)
                    opts.onOnMsg0(rlpxs, protocol, code, payload);
                return [2 /*return*/];
            });
        }); });
        peer.on('error', function (err) {
            if (opts.onPeerError0) {
                opts.onPeerError0(err, rlpxs);
            }
            else {
                console.log("Unexpected peer 0 error: " + err);
            }
        }); // (-> 2)
    });
    rlpxs[1].on('peer:added', function (peer) {
        var _this = this;
        var protocol = peer.getProtocols()[0];
        protocol.on('message', function (code, payload) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (code) {
                    // Comfortability hack, use constants like devp2p.ETH.MESSAGE_CODES.STATUS
                    // in production use
                    case 0x00: // (-> 1)
                        t.pass('should receive initial status message');
                        protocol.sendStatus(opts.status1); // (2 ->)
                        break;
                }
                if (opts.onOnMsg1)
                    opts.onOnMsg1(rlpxs, protocol, code, payload);
                return [2 /*return*/];
            });
        }); });
        peer.on('error', function (err) {
            if (opts.onPeerError1) {
                opts.onPeerError1(err, rlpxs);
            }
            else {
                console.log("Unexpected peer 1 error: " + err);
            }
        });
    });
}
exports.twoPeerMsgExchange = twoPeerMsgExchange;
function destroyRLPXs(rlpxs) {
    var e_2, _a;
    try {
        for (var rlpxs_1 = __values(rlpxs), rlpxs_1_1 = rlpxs_1.next(); !rlpxs_1_1.done; rlpxs_1_1 = rlpxs_1.next()) {
            var rlpx = rlpxs_1_1.value;
            // FIXME: Call destroy() on dpt instance from the rlpx.destroy() method
            rlpx._dpt.destroy();
            rlpx.destroy();
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (rlpxs_1_1 && !rlpxs_1_1.done && (_a = rlpxs_1.return)) _a.call(rlpxs_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
exports.destroyRLPXs = destroyRLPXs;
//# sourceMappingURL=util.js.map
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
var tape_1 = __importDefault(require("tape"));
var devp2p = __importStar(require("../../src"));
var util = __importStar(require("./util"));
var CHAIN_ID = 1;
var GENESIS_TD = 17179869184;
var GENESIS_HASH = Buffer.from('d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3', 'hex');
var capabilities = [devp2p.LES.les2];
var status = {
    networkId: CHAIN_ID,
    headTd: devp2p.int2buffer(GENESIS_TD),
    headHash: GENESIS_HASH,
    headNum: devp2p.int2buffer(0),
    genesisHash: GENESIS_HASH,
};
// FIXME: Handle unhandled promises directly
process.on('unhandledRejection', function (reason, p) { });
tape_1.default('LES: send status message (successful)', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var opts;
    return __generator(this, function (_a) {
        opts = {};
        opts.status0 = Object.assign({}, status);
        opts.status1 = Object.assign({}, status);
        opts.onOnceStatus0 = function (rlpxs, eth) {
            t.pass('should receive echoing status message and welcome connection');
            util.destroyRLPXs(rlpxs);
            t.end();
        };
        util.twoPeerMsgExchange(t, capabilities, opts);
        return [2 /*return*/];
    });
}); });
tape_1.default('LES: send status message (modified announceType)', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var opts;
    return __generator(this, function (_a) {
        opts = {};
        opts.status0 = Object.assign({}, status);
        opts.status0['announceType'] = 0;
        opts.status1 = Object.assign({}, status);
        opts.status1['announceType'] = 0;
        opts.onOnceStatus0 = function (rlpxs, eth) {
            t.pass('should receive echoing status message and welcome connection');
            util.destroyRLPXs(rlpxs);
            t.end();
        };
        util.twoPeerMsgExchange(t, capabilities, opts);
        return [2 /*return*/];
    });
}); });
tape_1.default('LES: send status message (NetworkId mismatch)', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var opts, status1;
    return __generator(this, function (_a) {
        opts = {};
        opts.status0 = Object.assign({}, status);
        status1 = Object.assign({}, status);
        status1['networkId'] = 2;
        opts.status1 = status1;
        opts.onPeerError0 = function (err, rlpxs) {
            var msg = 'NetworkId mismatch: 01 / 02';
            t.equal(err.message, msg, "should emit error: " + msg);
            util.destroyRLPXs(rlpxs);
            t.end();
        };
        util.twoPeerMsgExchange(t, capabilities, opts);
        return [2 /*return*/];
    });
}); });
tape_1.default('ETH: send status message (Genesis block mismatch)', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var opts, status1;
    return __generator(this, function (_a) {
        opts = {};
        opts.status0 = Object.assign({}, status);
        status1 = Object.assign({}, status);
        status1['genesisHash'] = Buffer.alloc(32);
        opts.status1 = status1;
        opts.onPeerError0 = function (err, rlpxs) {
            var msg = 'Genesis block mismatch: d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3 / 0000000000000000000000000000000000000000000000000000000000000000';
            t.equal(err.message, msg, "should emit error: " + msg);
            util.destroyRLPXs(rlpxs);
            t.end();
        };
        util.twoPeerMsgExchange(t, capabilities, opts);
        return [2 /*return*/];
    });
}); });
tape_1.default('LES: send valid message', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var opts;
    return __generator(this, function (_a) {
        opts = {};
        opts.status0 = Object.assign({}, status);
        opts.status1 = Object.assign({}, status);
        opts.onOnceStatus0 = function (rlpxs, les) {
            t.equal(les.getVersion(), 2, 'should use les2 as protocol version');
            les.sendMessage(devp2p.LES.MESSAGE_CODES.GET_BLOCK_HEADERS, 1, [437000, 1, 0, 0]);
            t.pass('should send GET_BLOCK_HEADERS message');
        };
        opts.onOnMsg1 = function (rlpxs, eth, code, payload) {
            if (code === devp2p.LES.MESSAGE_CODES.GET_BLOCK_HEADERS) {
                t.pass('should receive GET_BLOCK_HEADERS message');
                util.destroyRLPXs(rlpxs);
                t.end();
            }
        };
        util.twoPeerMsgExchange(t, capabilities, opts);
        return [2 /*return*/];
    });
}); });
tape_1.default('LES: send unknown message code', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var opts;
    return __generator(this, function (_a) {
        opts = {};
        opts.status0 = Object.assign({}, status);
        opts.status1 = Object.assign({}, status);
        opts.onOnceStatus0 = function (rlpxs, les) {
            try {
                les.sendMessage(0x55, 1, []);
            }
            catch (err) {
                var msg = 'Error: Unknown code 85';
                t.equal(err.toString(), msg, "should emit error: " + msg);
                util.destroyRLPXs(rlpxs);
                t.end();
            }
        };
        util.twoPeerMsgExchange(t, capabilities, opts);
        return [2 /*return*/];
    });
}); });
tape_1.default('LES: invalid status send', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var opts;
    return __generator(this, function (_a) {
        opts = {};
        opts.status0 = Object.assign({}, status);
        opts.status1 = Object.assign({}, status);
        opts.onOnceStatus0 = function (rlpxs, les) {
            try {
                les.sendMessage(devp2p.ETH.MESSAGE_CODES.STATUS, 1, []);
            }
            catch (err) {
                var msg = 'Error: Please send status message through .sendStatus';
                t.equal(err.toString(), msg, "should emit error: " + msg);
                util.destroyRLPXs(rlpxs);
                t.end();
            }
        };
        util.twoPeerMsgExchange(t, capabilities, opts);
        return [2 /*return*/];
    });
}); });
//# sourceMappingURL=les-simulator.js.map
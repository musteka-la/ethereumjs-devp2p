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
function delay(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
tape_1.default('DPT: new working node', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var dpts;
    return __generator(this, function (_a) {
        dpts = util.initTwoPeerDPTSetup();
        dpts[0].on('peer:new', function (peer) {
            t.equal(peer.address, '127.0.0.1', 'should have added peer on peer:new');
            util.destroyDPTs(dpts);
            t.end();
        });
        return [2 /*return*/];
    });
}); });
tape_1.default('DPT: working node added', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var dpts;
    return __generator(this, function (_a) {
        dpts = util.initTwoPeerDPTSetup();
        dpts[0].on('peer:added', function (peer) {
            t.equal(dpts[0].getPeers().length, 1, 'should have added peer to k-bucket on peer:added');
            util.destroyDPTs(dpts);
            t.end();
        });
        return [2 /*return*/];
    });
}); });
tape_1.default('DPT: remove node', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var dpts;
    return __generator(this, function (_a) {
        dpts = util.initTwoPeerDPTSetup();
        async_1.default.series([
            function (cb) {
                dpts[0].on('peer:added', function (peer) {
                    dpts[0].removePeer(peer);
                    cb(null);
                });
            },
            function (cb) {
                dpts[0].on('peer:removed', function (peer) {
                    t.equal(dpts[0].getPeers().length, 0, 'should have removed peer from k-bucket on peer:removed');
                    cb(null);
                });
            },
        ], function (err, results) {
            if (err) {
                t.fail('An unexpected error occured.');
            }
            util.destroyDPTs(dpts);
            t.end();
        });
        return [2 /*return*/];
    });
}); });
tape_1.default('DPT: ban node', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var dpts;
    return __generator(this, function (_a) {
        dpts = util.initTwoPeerDPTSetup();
        async_1.default.series([
            function (cb) {
                dpts[0].on('peer:added', function (peer) {
                    dpts[0].banPeer(peer);
                    cb(null);
                });
            },
            function (cb) {
                dpts[0].on('peer:removed', function (peer) {
                    t.equal(dpts[0].banlist.has(peer), true, 'ban-list should contain peer');
                    t.equal(dpts[0].getPeers().length, 0, 'should have removed peer from k-bucket on peer:removed');
                    cb(null);
                });
            },
        ], function (err, results) {
            if (err) {
                t.fail('An unexpected error occured.');
            }
            util.destroyDPTs(dpts);
            t.end();
        });
        return [2 /*return*/];
    });
}); });
tape_1.default('DPT: k-bucket ping', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var dpts;
    return __generator(this, function (_a) {
        dpts = util.initTwoPeerDPTSetup();
        async_1.default.series([
            function (cb) {
                dpts[0].on('peer:added', function (peer) {
                    dpts[0]._onKBucketPing([peer], peer);
                    setTimeout(function () {
                        cb(null);
                    }, 400);
                });
            },
            function (cb) {
                t.equal(dpts[0].getPeers().length, 1, 'should still have one peer in k-bucket');
                cb(null);
            },
        ], function (err, results) {
            if (err) {
                t.fail('An unexpected error occured.');
            }
            util.destroyDPTs(dpts);
            t.end();
        });
        return [2 /*return*/];
    });
}); });
tape_1.default('DPT: add non-available node', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var dpts, peer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dpts = util.getTestDPTs(1);
                peer = { address: util.localhost, udpPort: util.basePort + 1 };
                return [4 /*yield*/, dpts[0].addPeer(peer).catch(function (e) {
                        t.equal(e.message, 'Timeout error: ping 127.0.0.1:30307', 'should throw Timeout error');
                        util.destroyDPTs(dpts);
                        t.end();
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
tape_1.default('DPT: simulate bootstrap', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var numDPTs, dpts, _a, _b, dpt, e_1_1, dpts_1, dpts_1_1, dpt, e_2_1, dpts_2, dpts_2_1, dpt;
    var e_1, _c, e_2, _d, e_3, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                numDPTs = 6;
                dpts = util.getTestDPTs(numDPTs);
                return [4 /*yield*/, delay(250)];
            case 1:
                _f.sent();
                return [4 /*yield*/, dpts[0].addPeer({ address: util.localhost, udpPort: util.basePort + 1 })];
            case 2:
                _f.sent();
                return [4 /*yield*/, delay(100)];
            case 3:
                _f.sent();
                _f.label = 4;
            case 4:
                _f.trys.push([4, 9, 10, 11]);
                _a = __values(dpts.slice(2)), _b = _a.next();
                _f.label = 5;
            case 5:
                if (!!_b.done) return [3 /*break*/, 8];
                dpt = _b.value;
                return [4 /*yield*/, dpt.bootstrap({ address: util.localhost, udpPort: util.basePort + 1 })];
            case 6:
                _f.sent();
                _f.label = 7;
            case 7:
                _b = _a.next();
                return [3 /*break*/, 5];
            case 8: return [3 /*break*/, 11];
            case 9:
                e_1_1 = _f.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 11];
            case 10:
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 11:
                _f.trys.push([11, 16, 17, 18]);
                dpts_1 = __values(dpts), dpts_1_1 = dpts_1.next();
                _f.label = 12;
            case 12:
                if (!!dpts_1_1.done) return [3 /*break*/, 15];
                dpt = dpts_1_1.value;
                dpt.refresh();
                return [4 /*yield*/, delay(400)];
            case 13:
                _f.sent();
                _f.label = 14;
            case 14:
                dpts_1_1 = dpts_1.next();
                return [3 /*break*/, 12];
            case 15: return [3 /*break*/, 18];
            case 16:
                e_2_1 = _f.sent();
                e_2 = { error: e_2_1 };
                return [3 /*break*/, 18];
            case 17:
                try {
                    if (dpts_1_1 && !dpts_1_1.done && (_d = dpts_1.return)) _d.call(dpts_1);
                }
                finally { if (e_2) throw e_2.error; }
                return [7 /*endfinally*/];
            case 18: return [4 /*yield*/, delay(250)];
            case 19:
                _f.sent();
                util.destroyDPTs(dpts);
                try {
                    // dpts.forEach((dpt, i) => console.log(`${i}:${dpt.getPeers().length}`))
                    for (dpts_2 = __values(dpts), dpts_2_1 = dpts_2.next(); !dpts_2_1.done; dpts_2_1 = dpts_2.next()) {
                        dpt = dpts_2_1.value;
                        t.equal(dpt.getPeers().length, numDPTs, 'Peers should be distributed to all DPTs');
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (dpts_2_1 && !dpts_2_1.done && (_e = dpts_2.return)) _e.call(dpts_2);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                t.end();
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=dpt-simulator.js.map
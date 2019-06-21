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
var e_1, _a;
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var devp2p = __importStar(require("../src"));
var ethereumjs_block_1 = __importDefault(require("ethereumjs-block"));
var ms_1 = __importDefault(require("ms"));
var chalk_1 = __importDefault(require("chalk"));
var assert_1 = __importDefault(require("assert"));
var crypto_1 = require("crypto");
var PRIVATE_KEY = crypto_1.randomBytes(32);
var CHAIN_ID = 4; // Rinkeby
var GENESIS_TD = 1;
var GENESIS_HASH = Buffer.from('6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177', 'hex');
var BOOTNODES = require('ethereum-common')
    .bootstrapNodes.filter(function (node) {
    return node.chainId === CHAIN_ID;
})
    .map(function (node) {
    return {
        address: node.ip,
        udpPort: node.port,
        tcpPort: node.port,
    };
});
var REMOTE_CLIENTID_FILTER = [
    'go1.5',
    'go1.6',
    'go1.7',
    'Geth/v1.7',
    'quorum',
    'pirl',
    'ubiq',
    'gmc',
    'gwhale',
    'prichain',
];
var getPeerAddr = function (peer) { return peer._socket.remoteAddress + ":" + peer._socket.remotePort; };
// DPT
var dpt = new devp2p.DPT(PRIVATE_KEY, {
    refreshInterval: 30000,
    endpoint: {
        address: '0.0.0.0',
        udpPort: null,
        tcpPort: null,
    },
});
dpt.on('error', function (err) { return console.error(chalk_1.default.red("DPT error: " + err)); });
// RLPx
var rlpx = new devp2p.RLPx(PRIVATE_KEY, {
    dpt: dpt,
    maxPeers: 25,
    capabilities: [devp2p.LES.les2],
    remoteClientIdFilter: REMOTE_CLIENTID_FILTER,
    listenPort: null,
});
rlpx.on('error', function (err) { return console.error(chalk_1.default.red("RLPx error: " + (err.stack || err))); });
rlpx.on('peer:added', function (peer) {
    var addr = getPeerAddr(peer);
    var les = peer.getProtocols()[0];
    var requests = { headers: [], bodies: [] };
    var clientId = peer.getHelloMessage().clientId;
    console.log(chalk_1.default.green("Add peer: " + addr + " " + clientId + " (les" + les.getVersion() + ") (total: " + rlpx.getPeers().length + ")"));
    les.sendStatus({
        networkId: CHAIN_ID,
        headTd: devp2p.int2buffer(GENESIS_TD),
        headHash: GENESIS_HASH,
        headNum: Buffer.from([]),
        genesisHash: GENESIS_HASH,
    });
    les.once('status', function (status) {
        var msg = [devp2p.buffer2int(status['headNum']), 1, 0, 1];
        les.sendMessage(devp2p.LES.MESSAGE_CODES.GET_BLOCK_HEADERS, 1, msg);
    });
    les.on('message', function (code, payload) { return __awaiter(_this, void 0, void 0, function () {
        var _a, header_1, header2, block, isValid, isValidPayload;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = code;
                    switch (_a) {
                        case devp2p.LES.MESSAGE_CODES.BLOCK_HEADERS: return [3 /*break*/, 1];
                        case devp2p.LES.MESSAGE_CODES.BLOCK_BODIES: return [3 /*break*/, 2];
                    }
                    return [3 /*break*/, 4];
                case 1:
                    if (payload[2].length > 1) {
                        console.log(addr + " not more than one block header expected (received: " + payload[2].length + ")");
                        return [3 /*break*/, 4];
                    }
                    header_1 = new ethereumjs_block_1.default.Header(payload[2][0]);
                    setTimeout(function () {
                        les.sendMessage(devp2p.LES.MESSAGE_CODES.GET_BLOCK_BODIES, 2, [header_1.hash()]);
                        requests.bodies.push(header_1);
                    }, ms_1.default('0.1s'));
                    return [3 /*break*/, 4];
                case 2:
                    if (payload[2].length !== 1) {
                        console.log(addr + " not more than one block body expected (received: " + payload[2].length + ")");
                        return [3 /*break*/, 4];
                    }
                    header2 = requests.bodies.shift();
                    block = new ethereumjs_block_1.default([header2.raw, payload[2][0][0], payload[2][0][1]]);
                    return [4 /*yield*/, isValidBlock(block)];
                case 3:
                    isValid = _b.sent();
                    isValidPayload = false;
                    if (isValid) {
                        isValidPayload = true;
                        onNewBlock(block, peer);
                        return [3 /*break*/, 4];
                    }
                    if (!isValidPayload) {
                        console.log(addr + " received wrong block body");
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
});
rlpx.on('peer:removed', function (peer, reasonCode, disconnectWe) {
    var who = disconnectWe ? 'we disconnect' : 'peer disconnect';
    var total = rlpx.getPeers().length;
    console.log(chalk_1.default.yellow("Remove peer: " + getPeerAddr(peer) + " - " + who + ", reason: " + peer.getDisconnectPrefix(reasonCode) + " (" + String(reasonCode) + ") (total: " + total + ")"));
});
rlpx.on('peer:error', function (peer, err) {
    if (err.code === 'ECONNRESET')
        return;
    if (err instanceof assert_1.default.AssertionError) {
        var peerId = peer.getId();
        if (peerId !== null)
            dpt.banPeer(peerId, ms_1.default('5m'));
        console.error(chalk_1.default.red("Peer error (" + getPeerAddr(peer) + "): " + err.message));
        return;
    }
    console.error(chalk_1.default.red("Peer error (" + getPeerAddr(peer) + "): " + (err.stack || err)));
});
try {
    // uncomment, if you want accept incoming connections
    // rlpx.listen(30303, '0.0.0.0')
    // dpt.bind(30303, '0.0.0.0')
    for (var BOOTNODES_1 = __values(BOOTNODES), BOOTNODES_1_1 = BOOTNODES_1.next(); !BOOTNODES_1_1.done; BOOTNODES_1_1 = BOOTNODES_1.next()) {
        var bootnode = BOOTNODES_1_1.value;
        dpt.bootstrap(bootnode).catch(function (err) {
            console.error(chalk_1.default.bold.red("DPT bootstrap error: " + (err.stack || err)));
        });
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (BOOTNODES_1_1 && !BOOTNODES_1_1.done && (_a = BOOTNODES_1.return)) _a.call(BOOTNODES_1);
    }
    finally { if (e_1) throw e_1.error; }
}
// connect to local ethereum node (debug)
/*
dpt.addPeer({ address: '127.0.0.1', udpPort: 30303, tcpPort: 30303 })
  .then((peer) => {
    return rlpx.connect({
      id: peer.id,
      address: peer.address,
      port: peer.tcpPort
    })
  })
  .catch((err) => console.log(`error on connection to local node: ${err.stack || err}`)) */
function onNewBlock(block, peer) {
    var blockHashHex = block.hash().toString('hex');
    var blockNumber = devp2p.buffer2int(block.header.number);
    console.log("----------------------------------------------------------------------------------------------------------");
    console.log("block " + blockNumber + " received: " + blockHashHex + " (from " + getPeerAddr(peer) + ")");
    console.log("----------------------------------------------------------------------------------------------------------");
}
function isValidTx(tx) {
    return tx.validate(false);
}
function isValidBlock(block) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!block.validateUnclesHash())
                return [2 /*return*/, false];
            if (!block.transactions.every(isValidTx))
                return [2 /*return*/, false];
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    block.genTxTrie(function () {
                        try {
                            resolve(block.validateTransactionsTrie());
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                })];
        });
    });
}
setInterval(function () {
    var peersCount = dpt.getPeers().length;
    var openSlots = rlpx._getOpenSlots();
    var queueLength = rlpx._peersQueue.length;
    var queueLength2 = rlpx._peersQueue.filter(function (o) { return o.ts <= Date.now(); }).length;
    console.log(chalk_1.default.yellow("Total nodes in DPT: " + peersCount + ", open slots: " + openSlots + ", queue: " + queueLength + " / " + queueLength2));
}, ms_1.default('30s'));
//# sourceMappingURL=peer-communication-les.js.map
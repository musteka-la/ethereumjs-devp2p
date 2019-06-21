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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var e_1, _a;
var devp2p = __importStar(require("../src"));
var src_1 = require("../src");
var ethereumjs_tx_1 = __importDefault(require("ethereumjs-tx"));
var ethereumjs_block_1 = __importDefault(require("ethereumjs-block"));
var lru_cache_1 = __importDefault(require("lru-cache"));
var ms_1 = __importDefault(require("ms"));
var chalk_1 = __importDefault(require("chalk"));
var assert_1 = __importDefault(require("assert"));
var crypto_1 = require("crypto");
var rlp_encoding_1 = __importDefault(require("rlp-encoding"));
var PRIVATE_KEY = crypto_1.randomBytes(32);
var CHAIN_ID = 1;
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
    'quorum',
    'pirl',
    'ubiq',
    'gmc',
    'gwhale',
    'prichain',
];
var CHECK_BLOCK_TITLE = 'Byzantium Fork'; // Only for debugging/console output
var CHECK_BLOCK_NR = 4370000;
var CHECK_BLOCK = 'b1fcff633029ee18ab6482b58ff8b6e95dd7c82a954c852157152a7a6d32785e';
var CHECK_BLOCK_HEADER = rlp_encoding_1.default.decode(Buffer.from('f9020aa0a0890da724dd95c90a72614c3a906e402134d3859865f715f5dfb398ac00f955a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347942a65aca4d5fc5b5c859090a6c34d164135398226a074cccff74c5490fbffc0e6883ea15c0e1139e2652e671f31f25f2a36970d2f87a00e750bf284c2b3ed1785b178b6f49ff3690a3a91779d400de3b9a3333f699a80a0c68e3e82035e027ade5d966c36a1d49abaeec04b83d64976621c355e58724b8bb90100040019000040000000010000000000021000004020100688001a05000020816800000010a0000100201400000000080100020000000400080000800004c0200000201040000000018110400c000000200001000000280000000100000010010080000120010000050041004000018000204002200804000081000011800022002020020140000000020005080001800000000008102008140008600000000100000500000010080082002000102080000002040120008820400020100004a40801000002a0040c000010000114000000800000050008300020100000000008010000000100120000000040000000808448200000080a00000624013000000080870552416761fabf83475b02836652b383661a72845a25c530894477617266506f6f6ca0dc425fdb323c469c91efac1d2672dfdd3ebfde8fa25d68c1b3261582503c433788c35ca7100349f430', 'hex'));
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
    capabilities: [devp2p.ETH.eth63, devp2p.ETH.eth62],
    remoteClientIdFilter: REMOTE_CLIENTID_FILTER,
    listenPort: null,
});
rlpx.on('error', function (err) { return console.error(chalk_1.default.red("RLPx error: " + (err.stack || err))); });
rlpx.on('peer:added', function (peer) {
    var addr = getPeerAddr(peer);
    var eth = peer.getProtocols()[0];
    var requests = { headers: [], bodies: [], msgTypes: {} };
    var clientId = peer.getHelloMessage().clientId;
    console.log(chalk_1.default.green("Add peer: " + addr + " " + clientId + " (eth" + eth.getVersion() + ") (total: " + rlpx.getPeers().length + ")"));
    eth.sendStatus({
        networkId: CHAIN_ID,
        td: devp2p.int2buffer(17179869184),
        bestHash: Buffer.from('d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3', 'hex'),
        genesisHash: Buffer.from('d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3', 'hex'),
    });
    // check CHECK_BLOCK
    var forkDrop;
    var forkVerified = false;
    eth.once('status', function () {
        eth.sendMessage(devp2p.ETH.MESSAGE_CODES.GET_BLOCK_HEADERS, [CHECK_BLOCK_NR, 1, 0, 0]);
        forkDrop = setTimeout(function () {
            peer.disconnect(devp2p.DISCONNECT_REASONS.USELESS_PEER);
        }, ms_1.default('15s'));
        peer.once('close', function () { return clearTimeout(forkDrop); });
    });
    eth.on('message', function (code, payload) { return __awaiter(_this, void 0, void 0, function () {
        var e_2, _a, e_3, _b, _c, _loop_1, payload_1, payload_1_1, item, payload_2, payload_2_1, item, tx, headers, expectedHash, header, isValidPayload_1, header_1, _loop_2, state_1, isValidPayload, header, block, isValid, newBlock, isValidNewBlock;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (code in src_1.ETH.MESSAGE_CODES) {
                        requests.msgTypes[code] = code + 1;
                    }
                    else {
                        requests.msgTypes[code] = 1;
                    }
                    _c = code;
                    switch (_c) {
                        case devp2p.ETH.MESSAGE_CODES.NEW_BLOCK_HASHES: return [3 /*break*/, 1];
                        case devp2p.ETH.MESSAGE_CODES.TX: return [3 /*break*/, 2];
                        case devp2p.ETH.MESSAGE_CODES.GET_BLOCK_HEADERS: return [3 /*break*/, 3];
                        case devp2p.ETH.MESSAGE_CODES.BLOCK_HEADERS: return [3 /*break*/, 4];
                        case devp2p.ETH.MESSAGE_CODES.GET_BLOCK_BODIES: return [3 /*break*/, 5];
                        case devp2p.ETH.MESSAGE_CODES.BLOCK_BODIES: return [3 /*break*/, 6];
                        case devp2p.ETH.MESSAGE_CODES.NEW_BLOCK: return [3 /*break*/, 10];
                        case devp2p.ETH.MESSAGE_CODES.GET_NODE_DATA: return [3 /*break*/, 12];
                        case devp2p.ETH.MESSAGE_CODES.NODE_DATA: return [3 /*break*/, 13];
                        case devp2p.ETH.MESSAGE_CODES.GET_RECEIPTS: return [3 /*break*/, 14];
                        case devp2p.ETH.MESSAGE_CODES.RECEIPTS: return [3 /*break*/, 15];
                    }
                    return [3 /*break*/, 16];
                case 1:
                    if (!forkVerified)
                        return [3 /*break*/, 16];
                    _loop_1 = function (item) {
                        var blockHash = item[0];
                        if (blocksCache.has(blockHash.toString('hex')))
                            return "continue";
                        setTimeout(function () {
                            eth.sendMessage(devp2p.ETH.MESSAGE_CODES.GET_BLOCK_HEADERS, [blockHash, 1, 0, 0]);
                            requests.headers.push(blockHash);
                        }, ms_1.default('0.1s'));
                    };
                    try {
                        for (payload_1 = __values(payload), payload_1_1 = payload_1.next(); !payload_1_1.done; payload_1_1 = payload_1.next()) {
                            item = payload_1_1.value;
                            _loop_1(item);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (payload_1_1 && !payload_1_1.done && (_a = payload_1.return)) _a.call(payload_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    return [3 /*break*/, 16];
                case 2:
                    if (!forkVerified)
                        return [3 /*break*/, 16];
                    try {
                        for (payload_2 = __values(payload), payload_2_1 = payload_2.next(); !payload_2_1.done; payload_2_1 = payload_2.next()) {
                            item = payload_2_1.value;
                            tx = new ethereumjs_tx_1.default(item);
                            if (isValidTx(tx))
                                onNewTx(tx, peer);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (payload_2_1 && !payload_2_1.done && (_b = payload_2.return)) _b.call(payload_2);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    return [3 /*break*/, 16];
                case 3:
                    headers = [];
                    // hack
                    if (devp2p.buffer2int(payload[0]) === CHECK_BLOCK_NR) {
                        headers.push(CHECK_BLOCK_HEADER);
                    }
                    if (requests.headers.length === 0 && requests.msgTypes[code] >= 8) {
                        peer.disconnect(devp2p.DISCONNECT_REASONS.USELESS_PEER);
                    }
                    else {
                        eth.sendMessage(devp2p.ETH.MESSAGE_CODES.BLOCK_HEADERS, headers);
                    }
                    return [3 /*break*/, 16];
                case 4:
                    if (!forkVerified) {
                        if (payload.length !== 1) {
                            console.log(addr + " expected one header for " + CHECK_BLOCK_TITLE + " verify (received: " + payload.length + ")");
                            peer.disconnect(devp2p.DISCONNECT_REASONS.USELESS_PEER);
                            return [3 /*break*/, 16];
                        }
                        expectedHash = CHECK_BLOCK;
                        header = new ethereumjs_block_1.default.Header(payload[0]);
                        if (header.hash().toString('hex') === expectedHash) {
                            console.log(addr + " verified to be on the same side of the " + CHECK_BLOCK_TITLE);
                            clearTimeout(forkDrop);
                            forkVerified = true;
                        }
                    }
                    else {
                        if (payload.length > 1) {
                            console.log(addr + " not more than one block header expected (received: " + payload.length + ")");
                            return [3 /*break*/, 16];
                        }
                        isValidPayload_1 = false;
                        header_1 = new ethereumjs_block_1.default.Header(payload[0]);
                        _loop_2 = function () {
                            var blockHash = requests.headers.shift();
                            if (header_1.hash().equals(blockHash)) {
                                isValidPayload_1 = true;
                                setTimeout(function () {
                                    eth.sendMessage(devp2p.ETH.MESSAGE_CODES.GET_BLOCK_BODIES, [blockHash]);
                                    requests.bodies.push(header_1);
                                }, ms_1.default('0.1s'));
                                return "break";
                            }
                        };
                        while (requests.headers.length > 0) {
                            state_1 = _loop_2();
                            if (state_1 === "break")
                                break;
                        }
                        if (!isValidPayload_1) {
                            console.log(addr + " received wrong block header " + header_1.hash().toString('hex'));
                        }
                    }
                    return [3 /*break*/, 16];
                case 5:
                    if (requests.headers.length === 0 && requests.msgTypes[code] >= 8) {
                        peer.disconnect(devp2p.DISCONNECT_REASONS.USELESS_PEER);
                    }
                    else {
                        eth.sendMessage(devp2p.ETH.MESSAGE_CODES.BLOCK_BODIES, []);
                    }
                    return [3 /*break*/, 16];
                case 6:
                    if (!forkVerified)
                        return [3 /*break*/, 16];
                    if (payload.length !== 1) {
                        console.log(addr + " not more than one block body expected (received: " + payload.length + ")");
                        return [3 /*break*/, 16];
                    }
                    isValidPayload = false;
                    _d.label = 7;
                case 7:
                    if (!(requests.bodies.length > 0)) return [3 /*break*/, 9];
                    header = requests.bodies.shift();
                    block = new ethereumjs_block_1.default([header.raw, payload[0][0], payload[0][1]]);
                    return [4 /*yield*/, isValidBlock(block)];
                case 8:
                    isValid = _d.sent();
                    if (isValid) {
                        isValidPayload = true;
                        onNewBlock(block, peer);
                        return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 7];
                case 9:
                    if (!isValidPayload) {
                        console.log(addr + " received wrong block body");
                    }
                    return [3 /*break*/, 16];
                case 10:
                    if (!forkVerified)
                        return [3 /*break*/, 16];
                    newBlock = new ethereumjs_block_1.default(payload[0]);
                    return [4 /*yield*/, isValidBlock(newBlock)];
                case 11:
                    isValidNewBlock = _d.sent();
                    if (isValidNewBlock)
                        onNewBlock(newBlock, peer);
                    return [3 /*break*/, 16];
                case 12:
                    if (requests.headers.length === 0 && requests.msgTypes[code] >= 8) {
                        peer.disconnect(devp2p.DISCONNECT_REASONS.USELESS_PEER);
                    }
                    else {
                        eth.sendMessage(devp2p.ETH.MESSAGE_CODES.NODE_DATA, []);
                    }
                    return [3 /*break*/, 16];
                case 13: return [3 /*break*/, 16];
                case 14:
                    if (requests.headers.length === 0 && requests.msgTypes[code] >= 8) {
                        peer.disconnect(devp2p.DISCONNECT_REASONS.USELESS_PEER);
                    }
                    else {
                        eth.sendMessage(devp2p.ETH.MESSAGE_CODES.RECEIPTS, []);
                    }
                    return [3 /*break*/, 16];
                case 15: return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
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
  .catch((err) => console.log(`error on connection to local node: ${err.stack || err}`))
*/
var txCache = new lru_cache_1.default({ max: 1000 });
function onNewTx(tx, peer) {
    var txHashHex = tx.hash().toString('hex');
    if (txCache.has(txHashHex))
        return;
    txCache.set(txHashHex, true);
    console.log("New tx: " + txHashHex + " (from " + getPeerAddr(peer) + ")");
}
var blocksCache = new lru_cache_1.default({ max: 100 });
function onNewBlock(block, peer) {
    var e_4, _a;
    var blockHashHex = block.hash().toString('hex');
    var blockNumber = devp2p.buffer2int(block.header.number);
    if (blocksCache.has(blockHashHex))
        return;
    blocksCache.set(blockHashHex, true);
    console.log("----------------------------------------------------------------------------------------------------------");
    console.log("New block " + blockNumber + ": " + blockHashHex + " (from " + getPeerAddr(peer) + ")");
    console.log("----------------------------------------------------------------------------------------------------------");
    try {
        for (var _b = __values(block.transactions), _c = _b.next(); !_c.done; _c = _b.next()) {
            var tx = _c.value;
            onNewTx(tx, peer);
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_4) throw e_4.error; }
    }
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
//# sourceMappingURL=peer-communication.js.map
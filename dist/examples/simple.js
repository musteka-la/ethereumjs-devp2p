"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var e_1, _a;
var chalk_1 = __importDefault(require("chalk"));
var src_1 = require("../src");
var PRIVATE_KEY = 'd772e3d6a001a38064dd23964dd2836239fa0e6cec8b28972a87460a17210fe9';
var BOOTNODES = require('ethereum-common').bootstrapNodes.map(function (node) {
    return {
        address: node.ip,
        udpPort: node.port,
        tcpPort: node.port,
    };
});
var dpt = new src_1.DPT(Buffer.from(PRIVATE_KEY, 'hex'), {
    endpoint: {
        address: '0.0.0.0',
        udpPort: null,
        tcpPort: null,
    },
});
dpt.on('error', function (err) { return console.error(chalk_1.default.red(err.stack || err)); });
dpt.on('peer:added', function (peer) {
    var info = "(" + peer.id.toString('hex') + "," + peer.address + "," + peer.udpPort + "," + peer.tcpPort + ")";
    console.log(chalk_1.default.green("New peer: " + info + " (total: " + dpt.getPeers().length + ")"));
});
dpt.on('peer:removed', function (peer) {
    console.log(chalk_1.default.yellow("Remove peer: " + peer.id.toString('hex') + " (total: " + dpt.getPeers().length + ")"));
});
try {
    // for accept incoming connections uncomment next line
    // dpt.bind(30303, '0.0.0.0')
    for (var BOOTNODES_1 = __values(BOOTNODES), BOOTNODES_1_1 = BOOTNODES_1.next(); !BOOTNODES_1_1.done; BOOTNODES_1_1 = BOOTNODES_1.next()) {
        var bootnode = BOOTNODES_1_1.value;
        dpt.bootstrap(bootnode).catch(function (err) { return console.error(chalk_1.default.bold.red(err.stack || err)); });
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (BOOTNODES_1_1 && !BOOTNODES_1_1.done && (_a = BOOTNODES_1.return)) _a.call(BOOTNODES_1);
    }
    finally { if (e_1) throw e_1.error; }
}
//# sourceMappingURL=simple.js.map
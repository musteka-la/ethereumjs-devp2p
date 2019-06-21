import { Test } from 'tape';
import { DPT, RLPx } from '../../src';
export declare const localhost = "127.0.0.1";
export declare const basePort = 30306;
export declare function getTestDPTs(numDPTs: any): DPT[];
export declare function initTwoPeerDPTSetup(): DPT[];
export declare function destroyDPTs(dpts: any): void;
export declare function getTestRLPXs(numRLPXs: any, maxPeers: any, capabilities: any): RLPx[];
export declare function initTwoPeerRLPXSetup(maxPeers: any, capabilities: any): RLPx[];
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
export declare function twoPeerMsgExchange(t: Test, capabilities: any, opts: any): void;
export declare function destroyRLPXs(rlpxs: any): void;

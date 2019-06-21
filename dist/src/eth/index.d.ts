/// <reference types="node" />
import { EventEmitter } from 'events';
import { Peer } from '../rlpx/peer';
declare type SendMethod = (code: ETH.MESSAGE_CODES, data: Buffer) => any;
export declare class ETH extends EventEmitter {
    _version: number;
    _peer: Peer;
    _status: ETH.StatusMsg | null;
    _peerStatus: ETH.StatusMsg | null;
    _statusTimeoutId: NodeJS.Timeout;
    _send: SendMethod;
    constructor(version: number, peer: Peer, send: SendMethod);
    static eth62: {
        name: string;
        version: number;
        length: number;
        constructor: typeof ETH;
    };
    static eth63: {
        name: string;
        version: number;
        length: number;
        constructor: typeof ETH;
    };
    _handleMessage(code: ETH.MESSAGE_CODES, data: any): void;
    _handleStatus(): void;
    getVersion(): number;
    _getStatusString(status: ETH.StatusMsg): string;
    sendStatus(status: ETH.Status): void;
    sendMessage(code: ETH.MESSAGE_CODES, payload: any): void;
    getMsgPrefix(msgCode: ETH.MESSAGE_CODES): string;
}
export declare namespace ETH {
    type StatusMsg = {
        0: Buffer;
        1: Buffer;
        2: Buffer;
        3: Buffer;
        4: Buffer;
        length: 5;
    };
    type Status = {
        version: number;
        networkId: number;
        td: Buffer;
        bestHash: Buffer;
        genesisHash: Buffer;
    };
    enum MESSAGE_CODES {
        STATUS = 0,
        NEW_BLOCK_HASHES = 1,
        TX = 2,
        GET_BLOCK_HEADERS = 3,
        BLOCK_HEADERS = 4,
        GET_BLOCK_BODIES = 5,
        BLOCK_BODIES = 6,
        NEW_BLOCK = 7,
        GET_NODE_DATA = 13,
        NODE_DATA = 14,
        GET_RECEIPTS = 15,
        RECEIPTS = 16
    }
}
export {};

/// <reference types="node" />
import { EventEmitter } from 'events';
import LRUCache from 'lru-cache';
import { DPT } from './dpt';
import { Socket as DgramSocket, RemoteInfo } from 'dgram';
import { PeerInfo } from './message';
export interface DptServerOptions {
    timeout?: number;
    endpoint?: PeerInfo;
    createSocket?: Function;
}
export declare class Server extends EventEmitter {
    _dpt: DPT;
    _privateKey: Buffer;
    _timeout: number;
    _endpoint: PeerInfo;
    _requests: Map<string, any>;
    _parityRequestMap: Map<string, string>;
    _requestsCache: LRUCache<string, Promise<any>>;
    _socket: DgramSocket | null;
    constructor(dpt: DPT, privateKey: Buffer, options: DptServerOptions);
    bind(...args: any[]): void;
    destroy(...args: any[]): void;
    ping(peer: PeerInfo): Promise<any>;
    findneighbours(peer: PeerInfo, id: Buffer): void;
    _isAliveCheck(): void;
    _send(peer: PeerInfo, typename: string, data: any): Buffer;
    _handler(msg: Buffer, rinfo: RemoteInfo): void;
}

/// <reference types="node" />
import * as net from 'net';
import { EventEmitter } from 'events';
import LRUCache from 'lru-cache';
import { Peer, Capabilities } from './peer';
import { DPT, PeerInfo } from '../dpt';
export interface RLPxOptions {
    clientId?: Buffer;
    timeout?: number;
    dpt: DPT;
    maxPeers: number;
    remoteClientIdFilter?: string[];
    capabilities: Capabilities[];
    listenPort: number | null;
}
export declare class RLPx extends EventEmitter {
    _privateKey: Buffer;
    _id: Buffer;
    _timeout: number;
    _maxPeers: number;
    _clientId: Buffer;
    _remoteClientIdFilter?: string[];
    _capabilities: Capabilities[];
    _listenPort: number | null;
    _dpt: DPT;
    _peersLRU: LRUCache<string, boolean>;
    _peersQueue: {
        peer: PeerInfo;
        ts: number;
    }[];
    _server: net.Server | null;
    _peers: Map<string, net.Socket | Peer>;
    _refillIntervalId: NodeJS.Timeout;
    constructor(privateKey: Buffer, options: RLPxOptions);
    listen(...args: any[]): void;
    destroy(...args: any[]): void;
    connect(peer: PeerInfo): Promise<void>;
    getPeers(): (net.Socket | Peer)[];
    disconnect(id: Buffer): void;
    _isAlive(): boolean;
    _isAliveCheck(): void;
    _getOpenSlots(): number;
    _connectToPeer(peer: PeerInfo): void;
    _onConnect(socket: net.Socket, peerId: Buffer | null): void;
    _refillConnections(): void;
}

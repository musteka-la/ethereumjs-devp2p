/// <reference types="node" />
import { EventEmitter } from 'events';
import { BanList } from './ban-list';
export declare class DPT extends EventEmitter {
    privateKey: Buffer;
    banlist: BanList;
    private _id;
    private _kbucket;
    private _server;
    private _refreshIntervalId;
    constructor(privateKey: Buffer, options: any);
    bind(...args: any[]): void;
    destroy(...args: any[]): void;
    _onKBucketPing(oldPeers: any[], newPeer: any): void;
    _onServerPeers(peers: any[]): void;
    bootstrap(peer: any): Promise<void>;
    addPeer(obj: any): Promise<any>;
    getPeer(obj: any): any;
    getPeers(): any[];
    getClosestPeers(id: string): any;
    removePeer(obj: any): void;
    banPeer(obj: any, maxAge?: number): void;
    refresh(): void;
}

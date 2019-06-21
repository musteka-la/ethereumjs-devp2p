/// <reference types="node" />
import { EventEmitter } from 'events';
import _KBucket from 'k-bucket';
export interface KObj {
    id?: string;
    port?: string;
    address?: string;
}
export declare class KBucket extends EventEmitter {
    _peers: Map<string, any>;
    _kbucket: _KBucket;
    constructor(id: string | Buffer);
    static getKeys(obj: Buffer | string | KObj): string[];
    add(peer: any): void;
    get(obj: Buffer | string | KObj): any;
    getAll(): any;
    closest(id: string): any;
    remove(obj: Buffer | string | KObj): void;
}

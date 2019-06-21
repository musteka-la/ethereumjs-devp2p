/// <reference types="node" />
export declare function keccak256(...buffers: Buffer[]): any;
export declare function genPrivateKey(): Buffer;
export declare function pk2id(pk: Buffer): Buffer;
export declare function id2pk(id: Buffer): Buffer;
export declare function int2buffer(v: number): Buffer;
export declare function buffer2int(buffer: Buffer): number;
export declare function zfill(buffer: Buffer, size: number, leftpad?: boolean): Buffer;
export declare function xor(a: Buffer, b: any): Buffer;
export declare function assertEq(expected: any, actual: any, msg: string): void;
export declare class Deferred<T> {
    promise: Promise<T>;
    resolve: (...args: any[]) => any;
    reject: (...args: any[]) => any;
    constructor();
}
export declare function createDeferred<T>(): Deferred<T>;

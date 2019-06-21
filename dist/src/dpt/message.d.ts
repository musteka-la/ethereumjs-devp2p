/// <reference types="node" />
export interface PeerInfo {
    id?: Buffer;
    address?: string;
    udpPort?: number | null;
    tcpPort?: number | null;
}
export declare function encode<T>(typename: string, data: T, privateKey: Buffer): Buffer;
export declare function decode(buffer: Buffer): {
    typename: string | number;
    data: any;
    publicKey: Buffer;
};

/// <reference types="node" />
import { EventEmitter } from 'events';
import { ECIES } from './ecies';
import { Socket } from 'net';
import { ETH, LES } from '../';
export declare const BASE_PROTOCOL_VERSION = 4;
export declare const BASE_PROTOCOL_LENGTH = 16;
export declare const PING_INTERVAL: number;
export declare enum PREFIXES {
    HELLO = 0,
    DISCONNECT = 1,
    PING = 2,
    PONG = 3
}
export declare enum DISCONNECT_REASONS {
    DISCONNECT_REQUESTED = 0,
    NETWORK_ERROR = 1,
    PROTOCOL_ERROR = 2,
    USELESS_PEER = 3,
    TOO_MANY_PEERS = 4,
    ALREADY_CONNECTED = 5,
    INCOMPATIBLE_VERSION = 6,
    INVALID_IDENTITY = 7,
    CLIENT_QUITTING = 8,
    UNEXPECTED_IDENTITY = 9,
    SAME_IDENTITY = 10,
    TIMEOUT = 11,
    SUBPROTOCOL_ERROR = 16
}
export declare type HelloMsg = {
    0: Buffer;
    1: Buffer;
    2: Buffer[][];
    3: Buffer;
    4: Buffer;
    length: 5;
};
export interface ProtocolDescriptor {
    protocol?: any;
    offset: number;
    length?: number;
}
export interface ProtocolConstructor {
    new (...args: any[]): any;
}
export interface Capabilities {
    name: string;
    version: number;
    length: number;
    constructor: ProtocolConstructor;
}
export interface Hello {
    protocolVersion: number;
    clientId: string;
    capabilities: Capabilities[];
    port: number;
    id: Buffer;
}
export declare class Peer extends EventEmitter {
    _clientId: Buffer;
    _capabilities?: Capabilities[];
    _port: number;
    _id: Buffer;
    _remoteClientIdFilter: any;
    _remoteId: Buffer;
    _EIP8: Buffer;
    _eciesSession: ECIES;
    _state: string;
    _weHello: HelloMsg | null;
    _hello: Hello | null;
    _nextPacketSize: number;
    _socket: Socket;
    _pingIntervalId: NodeJS.Timeout | null;
    _pingTimeoutId: NodeJS.Timeout | null;
    _closed: boolean;
    _connected: boolean;
    _disconnectReason?: DISCONNECT_REASONS;
    _disconnectWe: any;
    _pingTimeout: number;
    _protocols: ProtocolDescriptor[];
    constructor(options: any);
    _parseSocketData(data: Buffer): void;
    _parsePacketContent(data: Buffer): void;
    private _getProtocol;
    _handleMessage(code: PREFIXES, msg: Buffer): void;
    _sendAuth(): void;
    _sendAck(): void;
    _sendMessage(code: number, data: Buffer): boolean | undefined;
    _sendHello(): void;
    _sendPing(): void;
    _sendPong(): void;
    _sendDisconnect(reason: DISCONNECT_REASONS): void;
    getId(): Buffer | null;
    getHelloMessage(): Hello | null;
    getProtocols<T extends ETH | LES>(): T[];
    getMsgPrefix(code: PREFIXES): string;
    getDisconnectPrefix(code: DISCONNECT_REASONS): string;
    disconnect(reason?: DISCONNECT_REASONS): void;
}

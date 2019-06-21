export declare class BanList {
    private lru;
    constructor();
    add(obj: any, maxAge?: number): void;
    has(obj: any): boolean;
}

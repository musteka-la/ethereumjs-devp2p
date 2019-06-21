"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var keccak_1 = __importDefault(require("keccak"));
var util_1 = require("../util");
var MAC = /** @class */ (function () {
    function MAC(secret) {
        this._hash = keccak_1.default('keccak256');
        this._secret = secret;
    }
    MAC.prototype.update = function (data) {
        this._hash.update(data);
    };
    MAC.prototype.updateHeader = function (data) {
        var aes = crypto_1.createCipheriv('aes-256-ecb', this._secret, '');
        var encrypted = aes.update(this.digest());
        this._hash.update(util_1.xor(encrypted, data));
    };
    MAC.prototype.updateBody = function (data) {
        this._hash.update(data);
        var prev = this.digest();
        var aes = crypto_1.createCipheriv('aes-256-ecb', this._secret, '');
        var encrypted = aes.update(prev);
        this._hash.update(util_1.xor(encrypted, prev));
    };
    MAC.prototype.digest = function () {
        return this._hash
            ._clone()
            .digest()
            .slice(0, 16);
    };
    return MAC;
}());
exports.MAC = MAC;
//# sourceMappingURL=mac.js.map
export declare function hashPassword(password: string, rounds?: number): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
export declare function encrypt(text: string, key: string): string;
export declare function decrypt(encryptedText: string, key: string): string;
export declare function generateApiKey(): string;
export declare function generateSecureToken(length?: number): string;
export declare function hashApiKey(apiKey: string): string;
//# sourceMappingURL=crypto.d.ts.map
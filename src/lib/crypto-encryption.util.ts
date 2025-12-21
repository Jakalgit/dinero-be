import * as crypto from 'crypto';

const ALGO = 'aes-256-gcm';
// const KEY = Buffer.from(process.env.PRIVATE_KEY_ENCRYPTION_SECRET, 'hex'); // 32 bytes

export class CryptoEncryption {
  static encrypt(plaintext: string, masterKey: string) {
    const iv = crypto.randomBytes(12); // recommended size for GCM
    const cipher = crypto.createCipheriv(
      ALGO,
      Buffer.from(masterKey, 'hex'),
      iv,
    );

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return {
      encryptedData: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  static decrypt(
    encryptedData: string,
    iv: string,
    tag: string,
    masterKey: string,
  ) {
    const decipher = crypto.createDecipheriv(
      ALGO,
      masterKey,
      Buffer.from(iv, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}

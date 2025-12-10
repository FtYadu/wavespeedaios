import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly encryptionKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('API_KEY_ENCRYPTION_KEY', '');
    if (!key) {
      throw new Error('API_KEY_ENCRYPTION_KEY environment variable is required');
    }

    const keyBuffer = Buffer.from(key, 'utf8');
    if (keyBuffer.length !== 32) {
      throw new Error('API_KEY_ENCRYPTION_KEY must be 32 bytes long');
    }

    this.encryptionKey = keyBuffer;
  }

  encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('base64')}:${encrypted.toString('base64')}:${authTag.toString('base64')}`;
  }

  decrypt(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const [ivEncoded, encryptedEncoded, authTagEncoded] = value.split(':');
    if (!ivEncoded || !encryptedEncoded || !authTagEncoded) {
      return null;
    }

    const iv = Buffer.from(ivEncoded, 'base64');
    const encrypted = Buffer.from(encryptedEncoded, 'base64');
    const authTag = Buffer.from(authTagEncoded, 'base64');

    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }
}

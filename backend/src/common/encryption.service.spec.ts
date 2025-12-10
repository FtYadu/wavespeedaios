import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    const config = {
      get: (key: string) => {
        if (key === 'API_KEY_ENCRYPTION_KEY') {
          return '12345678901234567890123456789012'; // 32 chars
        }
        return null;
      },
    } as ConfigService;

    service = new EncryptionService(config);
  });

  it('encrypts and decrypts values symmetrically', () => {
    const plain = 'test-api-key-value';
    const encrypted = service.encrypt(plain);
    expect(encrypted).not.toEqual(plain);

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toEqual(plain);
  });

  it('returns null when decrypting invalid payloads', () => {
    expect(service.decrypt(null)).toBeNull();
    expect(service.decrypt(undefined)).toBeNull();
    expect(service.decrypt('invalid')).toBeNull();
  });
});

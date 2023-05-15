import { compare, hash } from '../utils/hasher';

describe('Password Hash Functionality', () => {
    it('hashes the password', async () => {
        const password = 'Test.123';
        const hashedPassword = await hash(password);

        expect(hashedPassword).not.toBe(password);
    });

    it('throws an error if the password is not provided', async () => {
        await expect(hash('')).rejects.toThrow('No password to hash');
    });

    it('returns true if the password and hash match', async () => {
        const password = 'Test.123';
        const hashedPassword = await hash(password);

        const result = await compare(password, hashedPassword);
        expect(result).toBe(true);
    });

    it('returns false if the password and hash do not match', async () => {
        const password = 'Test.123';
        const hashedPassword = await hash(password);

        const result = await compare('Test1234', hashedPassword);
        expect(result).toBe(false);
    });

    it('throws an error if the password hash is invalid', async () => {
        await expect(compare('Test.123', '')).rejects.toThrow(
            'No password or hash provided'
        );
    });
});

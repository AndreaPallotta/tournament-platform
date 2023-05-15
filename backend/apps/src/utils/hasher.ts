import * as bcrypt from 'bcryptjs';

const rounds = 10;

export const hash = async (password: string) => {
    if (!password) throw new Error('No password to hash');
    try {
        const salt = await bcrypt.genSalt(rounds);
        return await bcrypt.hash(password, salt);
    } catch (e) {
        throw new Error(`Failed to hash password: ${e.message}`);
    }
};

export const compare = async (password: string, hash: string) => {
    if (!password || !hash) throw new Error('No password or hash provided');
    try {
        return await bcrypt.compare(password, hash);
    } catch (e) {
        throw new Error(`Failed to validate password hash: ${e.message}`);
    }
};

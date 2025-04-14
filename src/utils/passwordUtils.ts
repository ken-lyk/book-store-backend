import bcrypt from 'bcrypt';

const saltRounds = 10; // Adjust cost factor as needed

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
    plainText: string,
    hashed: string
): Promise<boolean> => {
    return bcrypt.compare(plainText, hashed);
};
import * as bcrypt from 'bcryptjs';
import { createUser, doesUserExist, getUser } from '../crud/auth.crud';
import { prismaMock } from '../prisma/singleton';
import { testUser } from './data';

describe('Verify that the user exists in database', () => {
    it('should throw an error if email is empty', () => {
        expect(doesUserExist('')).rejects.toThrow('Email is empty');
    });

    it('should return false if the user does not exist', async () => {
        jest.spyOn(prismaMock.user, 'count').mockResolvedValue(0);
        const result = await doesUserExist('user@notfound.com');
        expect(result).toBe(false);
    });

    it('should return true if the user exists', async () => {
        prismaMock.user.create.mockResolvedValue(testUser);

        const user = await createUser(testUser);

        expect(user).toMatchObject(testUser);
        expect(user.password).toMatch(testUser.password);
    });

    it('should throw an error if there is a failure', () => {
        prismaMock.user.count.mockRejectedValue(new Error('Database error'));
        expect(doesUserExist('existing-email@example.com')).rejects.toThrow(
            'Database error'
        );
    });
});

describe('Add new user to database', () => {
    it('should throw an error if email is already associated with another user', async () => {
        prismaMock.user.count.mockResolvedValue(1);
        expect(createUser(testUser)).rejects.toThrow(
            'Error creating user: User already exists'
        );
    });

    it('should create an account if email is not associated with another user', async () => {
        const spy = jest
            .spyOn(prismaMock.user, 'create')
            .mockResolvedValue(testUser);
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

        const result = await createUser(testUser);

        expect(spy).toHaveBeenCalledWith({
            data: {
                ...testUser,
                password: 'hashedPassword',
                page: {
                    picture: '',
                    bio: '',
                },
            },
        });

        expect(result).toMatchObject(testUser);
    });
});

describe('Get user from database', () => {
    it('should throw an error if no email and password are served', () => {
        expect(getUser({})).rejects.toThrow('User not found');
    });

    it('should throw an error if email not found', async () => {
        jest.spyOn(prismaMock.user, 'findFirstOrThrow').mockResolvedValue(
            testUser
        );

        try {
            await getUser({ email: 'invalid@example.com', password: testUser.password });
        } catch (err) {
            expect(err.message).toBe('User not found');
        }
    });

    it('should throw an error if password is incorrect', async () => {
        jest.spyOn(prismaMock.user, 'findFirstOrThrow').mockResolvedValue(
            testUser
        );
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        try {
            await getUser({ email: testUser.email, password: 'incorrect' });
        } catch (err) {
            expect(err.message).toBe('User not found');
        }
    });

    it('should retrieve a user with correct email and password', async () => {
        const spy = jest
            .spyOn(prismaMock.user, 'findFirst')
            .mockResolvedValue(testUser);
        const compareMock = jest.spyOn(bcrypt, 'compare');
        compareMock.mockResolvedValue(true as never);

        const result = await getUser({ email: testUser.email, password: testUser.password });

        expect(spy).toHaveBeenCalledWith({
            where: { email: testUser.email },
            select: {},
        });

        expect(compareMock).toHaveBeenCalledWith(
            testUser.password,
            testUser.password
        );
        expect(result).toMatchObject(testUser);
    });

    it('should retrieve a user with correct email and password', async () => {
        const spy = jest
            .spyOn(prismaMock.user, 'findFirst')
            .mockResolvedValue(testUser);
        const compareMock = jest.spyOn(bcrypt, 'compare');
        compareMock.mockResolvedValue(true as never);

        const result = await getUser({ email: testUser.email, password: testUser.password });

        expect(spy).toHaveBeenCalledWith({
            where: { email: testUser.email },
            select: {},
        });

        expect(compareMock).toHaveBeenCalledWith(
            testUser.password,
            testUser.password
        );
        expect(result).toMatchObject(testUser);
    });
});

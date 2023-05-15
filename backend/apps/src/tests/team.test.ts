import * as request from 'supertest';
import app from '../app';
import { prismaMock } from '../prisma/singleton';
import { testTeam, testUser } from './data';

const prefix = '/api/team';

jest.mock('aws-sdk', () => {
    const getObjectMock = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
            Body: Buffer.from('mocked file content'),
        }),
    });

    return {
        S3: jest.fn(() => ({
            getObject: getObjectMock,
        })),
    };
});

describe('POST /api/team', () => {
    jest.useFakeTimers({ legacyFakeTimers: true });

    it('should return status code 500 if team name is empty', async () => {
        jest.spyOn(prismaMock.user, 'findFirst').mockResolvedValueOnce(testUser);

        const res = await request(app).get(prefix).send({
            teamName: '',
            email: testUser.email
        });

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({
            error: 'Something went wrong when loading this page. Please try again.',
        });
    });

    // it('should return status code 500 if parameters are wrong', async () => {
    //     jest.spyOn(prismaMock.user, 'create').mockRejectedValueOnce(
    //         new Error(
    //             'There was some trouble creating your account. Please try again.'
    //         )
    //     );

    //     const res = await request(app).post(`${prefix}/signup`).send(user);

    //     expect(res.statusCode).toBe(500);
    //     expect(res.body).toMatchObject({
    //         error: 'There was some trouble creating your account. Please try again.',
    //     });
    // });

    // it('should return status code 200 if valid credentials are given', async () => {
    //     jest.spyOn(prismaMock.user, 'create').mockResolvedValueOnce(testUser);
    //     const res = await request(app).post(`${prefix}/signup`).send(user);

    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.user).toMatchObject({
    //         first_name: testUser.first_name,
    //         last_name: testUser.last_name,
    //         display_name: testUser.display_name,
    //         email: testUser.email,
    //     });
    // });
});

// describe('POST /api/auth/login', () => {
//     it('should return status code 400 if no request body is sent', async () => {
//         const res = await request(app).post(`${prefix}/login`);

//         expect(res.statusCode).toBe(400);
//         expect(res.body).toMatchObject({
//             error: 'email is invalid',
//         });
//     });

//     it('should return status code 500 if email or password is incorrect', async () => {
//         const res = await request(app).post(`${prefix}/login`).send({
//             email: 'test@example.com',
//             password: 'IncorrectPassword.1',
//         });

//         expect(res.statusCode).toBe(500);
//         expect(res.body).toMatchObject({
//             error: 'Your email or password is wrong. Please try again.',
//         });
//     });

//     it('should return status code 200 if valid credentials are given', async () => {
//         jest.spyOn(prismaMock.user, 'findFirst').mockResolvedValueOnce(
//             testUser
//         );
//         const res = await request(app).post(`${prefix}/login`).send(testUser);

//         expect(res.statusCode).toBe(200);
//         expect(res.body.user).toMatchObject({
//             first_name: testUser.first_name,
//             last_name: testUser.last_name,
//             email: testUser.email,
//         });
//     });
// });

// describe('POST /api/auth/refresh', () => {
//     it('should return status code 400 if no request body is sent', async () => {
//         const res = await request(app).post(`${prefix}/refresh`);

//         expect(res.statusCode).toBe(400);
//         expect(res.body).toMatchObject({
//             error: 'token is invalid',
//         });
//     });

//     it('should return status code 401 if email or password is incorrect', async () => {
//         const res = await request(app)
//             .post(`${prefix}/refresh`)
//             .send({ token: 'wrong-token' });

//         expect(res.statusCode).toBe(401);
//         expect(res.body).toMatchObject({
//             error: 'Cannot validate refresh token.',
//         });
//     });

//     it('should return status code 200 if valid credentials are given', async () => {
//         const token = generateRefreshToken(user.email);

//         const res = await request(app)
//             .post(`${prefix}/refresh`)
//             .send({ token });

//         expect(res.statusCode).toBe(200);
//         expect(res.body.auth_token).toBe(generateAuthToken(user.email));
//     });
// });

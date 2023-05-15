import { testUser, testTeam } from './data';
import app from '../app';
import * as request from 'supertest';
import { prismaMock } from '../prisma/singleton';
import { bufferToBase64 } from '../utils/bufferer';

const prefix: string = '/api/participantProfile';

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

const user = {
    first_name: testUser.first_name,
    last_name: testUser.last_name,
    display_name: testUser.display_name,
    email: testUser.email,
    password: testUser.password,
    confirm_password: testUser.password,
    page: {
        picture: testUser.page?.picture,
        bio: testUser.page?.bio
    }
};

const emailBody = {email:testUser.email}

const updateBody = {email:testUser.email, display_name: testUser.display_name,
    picture: testUser.page?.picture, bio: testUser.page?.bio}


describe('GET /api/participantProfile/', () => {
    it('should return status code 400 if parameters are wrong', async () => {
        const res = await request(app).get(`${prefix}/`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            error: 'email is invalid',
        });
    });

    it('should return status code 500 if parameters are wrong', async () => {
        jest.spyOn(prismaMock.user, 'findFirst').mockRejectedValueOnce(
            new Error(
                'There was some trouble finding your user. Please try again.'
            )
        );

        const res = await request(app).get(`${prefix}/`).send(emailBody);

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({
            error: 'User not found to display User Info.',
        });
    });

    it('should return status code 200 if valid credentials are given', async () => {
        jest.spyOn(prismaMock.user, 'findFirst').mockResolvedValueOnce(testUser);
        const res = await request(app).get(`${prefix}/`).send(emailBody);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject(
            {
                user: {
                    first_name: testUser.first_name,
                    last_name: testUser.last_name,
                    display_name: testUser.display_name,
                    email: testUser.email,
                    password: testUser.password,
                    role: testUser.role,
                    page: testUser.page,
                    invites: [testTeam.id]
                    },
                userPicture: bufferToBase64(Buffer.from('mocked file content'))
            });
    });
});

describe('POST /api/participantProfile/updateInfo', () => {
    it('should return status code 400 if no request body is sent', async () => {
        const res = await request(app).post(`${prefix}/updateInfo`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            error: 'Display name is invalid',
        });
    });

    it('should return status code 500 if email is incorrect', async () => {
        jest.spyOn(prismaMock.user, 'count').mockResolvedValueOnce(0)
        jest.spyOn(prismaMock.user, 'update').mockRejectedValueOnce(
            new Error(
                'There was some trouble updating your user. Please try again.'
            )
        );

        const res = await request(app).post(`${prefix}/updateInfo`).send(updateBody);

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({
                error: 'We could not update your page with your new info. Please try again.',
            });
        });

    it('should return status code 200 if valid credentials are given', async () => {
        jest.spyOn(prismaMock.user, 'count').mockResolvedValueOnce(1)
        jest.spyOn(prismaMock.user, 'update').mockResolvedValueOnce(
            testUser
        );
        const res = await request(app).post(`${prefix}/updateInfo`).send(updateBody);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            message: "Info has been updated"
        });
    });
});
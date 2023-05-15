import { ReviewStatus, Role, User } from '@prisma/client';
import { before } from 'node:test';
import * as request from 'supertest';
import app from '../app';
import { prismaMock } from '../prisma/singleton';
import { testUser, testTeam } from './data';

const prefix = '/api/participantProfile';

var user
var userWithTeam
var userWithoutTeam
var team
var data

beforeEach(() => {
    user = {
        id: testUser.id,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        display_name: testUser.display_name,
        email: testUser.email,
        password: testUser.password,
        confirm_password: testUser.password,
        invites: [testTeam.id],
        role: Role.ADMIN,
        team_id: null,
        review_status: ReviewStatus.IN_REVIEW,
        page: {
            picture: testUser.page?.picture,
            bio: testUser.page?.bio
        },
    };

    userWithTeam = {
        id: testUser.id,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        display_name: testUser.display_name,
        email: testUser.email,
        password: testUser.password,
        confirm_password: testUser.password,
        invites: [testTeam.id],
        role: Role.ADMIN,
        team_id: testTeam.id,
        review_status: ReviewStatus.IN_REVIEW,
        page: {
            picture: testUser.page?.picture,
            bio: testUser.page?.bio
        },
    }

    userWithoutTeam = {
        id: testUser.id,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        display_name: testUser.display_name,
        email: testUser.email,
        password: testUser.password,
        confirm_password: testUser.password,
        invites: [testTeam.id],
        role: Role.ADMIN,
        team_id: null,
        review_status: ReviewStatus.IN_REVIEW,
        page: {
            picture: testUser.page?.picture,
            bio: testUser.page?.bio
        },
    }

    team = {
        id: testTeam.id,
        name: testTeam.name,
        college_id: testTeam.college_id,
        page: testTeam.page,
        upvotes: testTeam.upvotes,
        // tournament_ids: testTeam.tournament_ids,
        current_game: testTeam.current_game,
        review_status: testTeam.review_status,
        players: [userWithTeam]
    }

    data = { email: testUser.email, team_id: testTeam.id }
})



describe('POST /api/teamInvites/acceptInvite', () => {
    it('should return status code 400 if parameters are wrong', async () => {
        const res = await request(app).post(`${prefix}/acceptInvite`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            error: 'Team id is invalid',
        });
    });

    it('should return status code 500 if parameters are wrong', async () => {
        jest.spyOn(prismaMock.team, 'update').mockRejectedValueOnce(
            new Error(
                'There was some trouble accepting your invite. Please try again.'
            )
        );

        const res = await request(app).post(`${prefix}/acceptInvite`).send(data);

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({
            error: 'Invites for User not found',
        });
    });

    it('should return status code 200 if valid credentials are given', async () => {
        jest.spyOn(prismaMock.user, 'findFirst').mockResolvedValue(testUser);
        jest.spyOn(prismaMock.team, 'update').mockResolvedValue(team);
        jest.spyOn(prismaMock.team, 'findFirst').mockResolvedValue(team);
        jest.spyOn(prismaMock.user, 'update').mockResolvedValue(testUser);
        const res = await request(app).post(`${prefix}/acceptInvite`).send(data);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            first_name: testUser.first_name,
            last_name: testUser.last_name,
            display_name: testUser.display_name,
            email: testUser.email,
            password: testUser.password,
            invites: [],
            role: Role.ADMIN,
            page: {
                picture: testUser.page?.picture,
                bio: testUser.page?.bio
            }
        });
    });
});

describe('POST /api/teamInvites/rejectInvite', () => {
    it('should return status code 400 if no request body is sent', async () => {
        const res = await request(app).post(`${prefix}/rejectInvite`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            error: 'Team id is invalid',
        });
    });

    it('should return status code 500 if parameters are wrong', async () => {
        jest.spyOn(prismaMock.team, 'update').mockRejectedValueOnce(
            new Error(
                'There was some trouble rejecting your invite. Please try again.'
            )
        );

        const res = await request(app).post(`${prefix}/rejectInvite`).send(data);

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({
            error: 'Invites for User not found',
        });
    });

    it('should return status code 200 if valid credentials are given', async () => {
        jest.spyOn(prismaMock.user, 'findFirst').mockResolvedValue(userWithoutTeam as User);
        jest.spyOn(prismaMock.user, 'update').mockResolvedValue(userWithoutTeam as User);
        const res = await request(app).post(`${prefix}/rejectInvite`).send(data);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            first_name: testUser.first_name,
            last_name: testUser.last_name,
            display_name: testUser.display_name,
            email: testUser.email,
            password: testUser.password,
            invites: [],
            role: Role.ADMIN,
            team_id: null,
            page: {
                picture: testUser.page?.picture,
                bio: testUser.page?.bio
            }
        });
    });
});

describe('POST /api/teamInvites/leaveTeam', () => {
    it('should return status code 400 if no request body is sent', async () => {
        const res = await request(app).post(`${prefix}/leaveTeam`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            error: 'Team id is invalid',
        });
    });

    it('should return status code 500 if parameters are wrong', async () => {
        jest.spyOn(prismaMock.user, 'findFirst').mockResolvedValue(testUser);
        jest.spyOn(prismaMock.team, 'update').mockRejectedValue(
            new Error(
                'There was some trouble leaving your team. Please try again.'
            )
        );

        const res = await request(app).post(`${prefix}/leaveTeam`).send(data);

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({
            error: 'You are not part of this team',
        });
    });

    it('should return status code 200 if valid credentials are given', async () => {
        jest.spyOn(prismaMock.user, 'findFirst').mockResolvedValue(userWithTeam as User);
        jest.spyOn(prismaMock.team, 'update').mockResolvedValue(team);
        jest.spyOn(prismaMock.user, 'update').mockResolvedValue(userWithoutTeam as User);
        const res = await request(app).post(`${prefix}/leaveTeam`).send(data);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            id: testUser.id,
            first_name: testUser.first_name,
            last_name: testUser.last_name,
            display_name: testUser.display_name,
            email: testUser.email,
            password: testUser.password,
            confirm_password: testUser.password,
            invites: [testTeam.id],
            role: Role.ADMIN,
            team_id: null,
            review_status: ReviewStatus.IN_REVIEW,
            page: {
                picture: testUser.page?.picture,
                bio: testUser.page?.bio
            }
        });
    });
});
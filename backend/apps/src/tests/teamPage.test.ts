import * as request from 'supertest';
import app from '../app';
import { generateAuthToken, generateRefreshToken } from '../auth/jwt';
import { prismaMock } from '../prisma/singleton';
import { testUser, testTeam } from './data';

const prefix = '/api/teamPage';

const user = {
    first_name: testUser.first_name,
    last_name: testUser.last_name,
    display_name: testUser.display_name,
    email: testUser.email,
    password: testUser.password,
    confirm_password: testUser.password,
};

const team = {
    id: testTeam.id,
    name: testTeam.name,
    college_id: testTeam.college_id,
    page: testTeam.page,
    upvotes: testTeam.upvotes,
    tournament_id: testTeam.tournament_id,
    current_game: testTeam.current_game,
    review_status: testTeam.review_status
}

const teamID = { id: testTeam.id }

describe('GET /api/teamPage/', () => {
    jest.useFakeTimers({ legacyFakeTimers: true });
    it('should return status code 400 if parameters are wrong', async () => {
        const res = await request(app).get(`${prefix}/`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            error: 'id is invalid',
        });
    });

    it('should return status code 500 if parameters are wrong', async () => {
        jest.spyOn(prismaMock.team, 'findFirst').mockRejectedValueOnce(
            new Error(
                'There was some trouble finding your team. Please try again.'
            )
        );

        const res = await request(app).get(`${prefix}/`).send(teamID);

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({
            error: 'Error finding your team: There was some trouble finding your team. Please try again.',
        });
    });

    it('should return status code 200 if valid credentials are given', async () => {
        jest.spyOn(prismaMock.team, 'findFirst').mockResolvedValueOnce(team);
        const res = await request(app).get(`${prefix}/`).send(teamID);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            id: testTeam.id,
            name: testTeam.name,
            college_id: testTeam.college_id,
            page: testTeam.page,
            upvotes: testTeam.upvotes,
            tournament_id: testTeam.tournament_id,
            current_game: testTeam.current_game,
            review_status: testTeam.review_status
        });
    });
});

describe('PUT /api/teamPage/upvote', () => {
    it('should return status code 400 if no request body is sent', async () => {
        const res = await request(app).put(`${prefix}/upvote`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            error: 'id is invalid',
        });
    });

    it('should return status code 500 if parameters are wrong', async () => {
        jest.spyOn(prismaMock.team, 'update').mockRejectedValueOnce(
            new Error(
                'There was some trouble upvoting your team. Please try again.'
            )
        );

        const res = await request(app).put(`${prefix}/upvote`).send(teamID);

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({
            error: 'Error finding your team: Team not found',
        });
    });

    it('should return status code 200 if valid credentials are given', async () => {
        jest.spyOn(prismaMock.team, 'findFirst').mockResolvedValueOnce(team);
        jest.spyOn(prismaMock.team, 'update').mockResolvedValueOnce(team);
        const res = await request(app).put(`${prefix}/upvote`).send(teamID);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            id: testTeam.id,
            name: testTeam.name,
            college_id: testTeam.college_id,
            page: testTeam.page,
            upvotes: testTeam.upvotes,
            tournament_id: testTeam.tournament_id,
            current_game: testTeam.current_game,
            review_status: testTeam.review_status
        });
    });
});
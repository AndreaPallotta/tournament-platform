// import * as request from 'supertest';
// import app from '../app';
// import { prismaMock } from '../prisma/singleton';
// import { testUser, testTeam, testCollege, testGame, testTournemant } from './data';

// const prefix = '/api/collegePage';

// const user = {
//     first_name: testUser.first_name,
//     last_name: testUser.last_name,
//     display_name: testUser.display_name,
//     email: testUser.email,
//     password: testUser.password,
//     confirm_password: testUser.password,
// };

// const team = {
//     id: testTeam.id,
//     name: testTeam.name,
//     college_id: testTeam.college_id,
//     page: testTeam.page,
//     upvotes: testTeam.upvotes,
//     tournament_ids: testTeam.tournament_ids,
//     current_game: testTeam.current_game,
//     review_status: testTeam.review_status
// }


// const game = {
//     id: testGame.id,
//     tournament_id: testGame.tournament_id,
//     winner: testGame.winner,
//     page: testGame.page
// }

// const tournament = {
//     id: testTournemant.id,
//     college_id : testTournemant.college_id,
//     description: testTournemant.description,
//     team_ids: testTournemant.team_ids,
//     page: testTournemant.page,
//     games: [game]
// }

// const college = {
//     id: testCollege.id,
//     name: testCollege.name,
//     page: testCollege.page,
//     teams: [team],
//     tournaments: [tournament] 
// }

// const name = {name: testCollege.name}

// describe('GET /api/collegePage/', () => {
//     it('should return status code 400 if parameters are wrong', async () => {
//         const res = await request(app).get(`${prefix}/`);

//         expect(res.statusCode).toBe(400);
//         expect(res.body).toMatchObject({
//             error: 'name is invalid',
//         });
//     });

//     it('should return status code 500 if parameters are wrong', async () => {
//         jest.spyOn(prismaMock.college, 'findFirst').mockRejectedValueOnce(
//             new Error(
//                 'There was some trouble finding your college. Please try again.'
//             )
//         );

//         const res = await request(app).get(`${prefix}/`).send(name);

//         expect(res.statusCode).toBe(500);
//         expect(res.body).toMatchObject({
//             error: 'Error finding your college: There was some trouble finding your college. Please try again.',
//         });
//     });

//     it('should return status code 200 if valid credentials are given', async () => {
//         jest.spyOn(prismaMock.college, 'findFirst').mockResolvedValueOnce(college);
//         const res = await request(app).get(`${prefix}/`).send(name);

//         expect(res.statusCode).toBe(200);
//         expect(res.body).toMatchObject({
//             id: testCollege.id,
//             name: testCollege.name,
//             page: testCollege.page,
//         });
//     });
// });

// describe('GET /api/collegePage/teams', () => {
//     it('should return status code 400 if no request body is sent', async () => {
//         const res = await request(app).get(`${prefix}/teams`);

//         expect(res.statusCode).toBe(400);
//         expect(res.body).toMatchObject({
//             error: 'name is invalid',
//         });
//     });

//     it('should return status code 500 if parameters are wrong', async () => {
//         jest.spyOn(prismaMock.college, 'findFirst').mockRejectedValueOnce(
//             new Error(
//                 'There was some trouble finding your colleges teams. Please try again.'
//             )
//         );

//         const res = await request(app).get(`${prefix}/teams`).send(name);

//         expect(res.statusCode).toBe(500);
//         expect(res.body).toMatchObject({
//             error: 'Error finding your teams: There was some trouble finding your colleges teams. Please try again.',
//         });
//     });

//     it('should return status code 200 if valid credentials are given', async () => {
//         jest.spyOn(prismaMock.college, 'findFirst').mockResolvedValueOnce(college);
//         const res = await request(app).get(`${prefix}/teams`).send(name);

//         expect(res.statusCode).toBe(200);
//         expect(res.body).toMatchObject({
//             teams:[team]
//         });
//     });
// });

// // describe('GET /api/collegePage/matches', () => {
// //     it('should return status code 400 if parameters are wrong', async () => {
// //         const res = await request(app).get(`${prefix}/matches`);

// //         expect(res.statusCode).toBe(400);
// //         expect(res.body).toMatchObject({
// //             error: 'name is invalid',
// //         });
// //     });

// //     it('should return status code 500 if parameters are wrong', async () => {
// //         jest.spyOn(prismaMock.college, 'findFirst').mockRejectedValueOnce(
// //             new Error(
// //                 'There was some trouble finding your colleges matches. Please try again.'
// //             )
// //         );

// //         const res = await request(app).get(`${prefix}/matches`).send(name);

// //         expect(res.statusCode).toBe(500);
// //         expect(res.body).toMatchObject({
// //             error: 'Error finding your matches: There was some trouble finding your colleges matches. Please try again.',
// //         });
// //     });

// //     it('should return status code 200 if valid credentials are given', async () => {
// //         jest.spyOn(prismaMock.college, 'findFirst').mockResolvedValueOnce(college);
// //         const res = await request(app).get(`${prefix}/matches`).send(name);

// //         expect(res.statusCode).toBe(200);
// //         expect(res.body).toMatchObject({
// //             matches:[game]
// //         });
// //     });
// // });
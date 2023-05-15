import { College, Game, Prisma, Role, Team, Tournament, User } from '@prisma/client';

export const testTeam = {
    id: 'testid',
    name: 'testTeam',
    college_id: '123',
    page: {
        picture: 'https://example.com',
        bio: 'Testing Team Bio'
    },
    upvotes: 12,
    tournament_id: '123',
    current_game: 'wasd',
    review_status: 'IN_REVIEW',
    players: []
} as Team;

export const testUser = {
    id: 'userid',
    first_name: 'Berkie',
    last_name: 'Ballantine',
    display_name: 'bballantine0',
    email: 'bballantine0@tumblr.com',
    password: 'OnX3ds.zds',
    role: Role.ADMIN,
    invites: ['testid'],
    page: {
        picture: '63fac100ef0df8961717299f',
        bio: 'Fake Person'
    }
} as User;

export const testCollege = {
    id: 'testid',
    name: 'testCollege',
    page: {
        picture: '63fac100ef0df8961717299f',
        bio: 'Fake bio'
    }
} as College

// export const testTournemant = {
//     id: 'testid',
//     college_id: 'testid',
//     description: 'testDescription',
//     team_ids: ['testid1, testid2'],
//     name: 'Text Tournament',
//     status: 'UNSTARTED',
//     deadline: new Date("2/1/22"),
//     start_date: new Date("2/2/22"),
//     end_date: new Date("2/3/22"),
//     page: {
//         picture: '63fac100ef0df8961717299f',
//         bio: 'Fake bio'
//     }
// } as Tournament

export const testGame = {
    id: 'testid',
    tournament_id: 'testTournamtentID',
    winner: 'winner',
    page: {
        picture: '63fac100ef0df8961717299f',
        bio: 'Fake bio'
    }
} as Game
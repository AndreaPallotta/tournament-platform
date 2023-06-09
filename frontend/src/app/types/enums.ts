export enum Role {
    VISITOR = 'VISITOR',
    REGISTERED_USER = 'REGISTERED_USER',
    PLAYER = 'PLAYER',
    TEAM_CAPTAIN = 'TEAM_CAPTAIN',
    UNIVERSITY_MARKETING_MOD = 'UNIVERSITY_MARKETING_MOD',
    UNIVERSITY_TOURNAMENT_MOD = 'UNIVERSITY_TOURNAMENT_MOD',
    AARDVARK_TOURNAMENT_MOD = 'AARDVARK_TOURNAMENT_MOD',
    ADMIN = 'ADMIN',
}

export enum ReviewStatus {
    IN_REVIEW = 'IN_REVIEW',
    APPROVED = 'APPROVED',
    DENIED = 'DENIED',
}

export enum TournamentStatus {
    UNSTARTED = 'UNSTARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    TERMINATED = 'TERMINATED',
}

export enum GameStatus {
    UNSTARTED = 'UNSTARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    PLAYED = 'PLAYED',
}

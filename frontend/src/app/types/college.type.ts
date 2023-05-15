import type { Page } from "./page.types";
import type { Team } from "./team.types";
import { Tournament } from "./tournament.types";
import type { User } from "./user.types";

export interface College {
    id: string;
    name: string;
    teams: Team[];
    users: User[];
    page?: Page;
    tournament_id?: string;
    tournament: Tournament;
}
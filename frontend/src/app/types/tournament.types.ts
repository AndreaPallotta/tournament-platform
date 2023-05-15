import type { College } from "./college.type";
import { TournamentStatus } from "./enums";
import type { Game } from "./game.types";
import type { Page } from "./page.types";
import type { Team } from "./team.types";

export interface Tournament {
    id: string;
    college: College;
    parent_id: string;
    name: string;
    deadline: string;
    start_date: string;
    end_date: string;
    teams: Team[];
    status: TournamentStatus;
    games: Game;
    page?: Page;
}
import type { GameTeams } from "./gameTeams.types";
import type { Page } from "./page.types";
import type { Tournament } from "./tournament.types";

export interface Game {
    id: string;
    tournament_id: string;
    tournament: Tournament;
    winner: string;
    teams: GameTeams;
    page?: Page;
}
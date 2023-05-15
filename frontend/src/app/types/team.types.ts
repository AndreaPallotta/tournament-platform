import type { College } from './college.type';
import { ReviewStatus } from './enums';
import type { Page } from './page.types';
import { Tournament } from './tournament.types';
import type { User } from './user.types';

export interface Team {
    id: string;
    name: string;
    college_id?: string;
    college?: College;
    players: User[];
    page?: Page;
    upvotes: number;
    tournament_id: string;
    tournament: Tournament;
    current_game?: string;
    review_status: ReviewStatus;
}

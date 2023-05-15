import type { College } from './college.type';
import { ReviewStatus, Role } from './enums';
import type { Page } from './page.types';
import type { Team } from './team.types';

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    display_name: string;
    email: string;
    college_id?: string;
    college?: College;
    role: Role;
    team_id: string | null;
    invites: string[];
    upvoted_teams: string[];
    team?: Team;
    page?: Page;
    review_status: ReviewStatus;
    authToken: string;
}

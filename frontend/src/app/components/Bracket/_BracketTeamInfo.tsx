import { Divider, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Team } from 'src/app/types/team.types';
import { User } from 'src/app/types/user.types';

interface IBracketTeamInfoProps {
    team: Team;
}

const BracketTeamInfo = ({ team }: IBracketTeamInfoProps) => {
    const navigate = useNavigate();

    return (
        <Stack
            spacing="32px"
            sx={{
                width: '100%',
                textAlign: 'start',
            }}
        >
            <Typography
                variant="bold"
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                    navigate(`/team/${team.name}`);
                }}
            >
                {team?.name}
            </Typography>
            <Divider />
            <Stack spacing="16px">
                <Typography variant="card">Members</Typography>
                {team?.players?.map((player: User) => (
                    <Typography
                        key={player.id}
                        sx={{
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            navigate(`/profile/${player.id}`);
                        }}
                    >
                        {player.display_name}
                    </Typography>
                ))}
            </Stack>
        </Stack>
    );
};

export default BracketTeamInfo;

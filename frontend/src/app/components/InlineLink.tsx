import { Link as MUILink, SxProps, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { globalStyleVars } from '../app';

interface IInlineLinkProps {
    to: string;
    text: string;
    underline?: 'none' | 'hover' | 'always';
    sx?: SxProps;
}

const InlineLink = ({ to, text, underline = 'none', sx }: IInlineLinkProps) => {
    return (
        <MUILink
            to={to}
            underline={underline}
            sx={{
                textDecoration: 'none',
                color: 'white',
                backgroundColor: globalStyleVars.inlineLinkColor,
                border: `2px solid ${globalStyleVars.inlineLinkColor}`,
                padding: '5px',
                borderRadius: '2px',
                width: 'fit-content',
                display: 'inline-block',
                margin: '5px',
                transition: 'background-color, color 250ms ease',
                ':hover': {
                    backgroundColor: 'white',
                    color: 'black',
                },
                ...sx,
            }}
            component={Link}
        >
            <Typography>
                <b>{text}</b>
            </Typography>
        </MUILink>
    );
};

export default InlineLink;

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 500,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}));

const passwordRequirements = [
    'At least 8 characters',
    'At most 30 characters',
    'At least one uppercase letter',
    'At least one lowercase letter',
    'At least one number',
    'At least one special character',
];

const PasswordTooltip = () => {
    return (
        <HtmlTooltip
            arrow
            placement="right"
            PopperProps={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 15],
                        },
                    },
                ],
            }}
            style={{ cursor: 'pointer' }}
            title={
                <Box sx={{ p: 2 }}>
                    <Typography color="inherit">
                        Password Requirements
                    </Typography>
                    <ul style={{ padding: '0.5rem' }}>
                        {passwordRequirements.map(
                            (req: string, index: number) => (
                                <li key={index}>{req}</li>
                            )
                        )}
                    </ul>
                </Box>
            }
        >
            <InfoOutlinedIcon />
        </HtmlTooltip>
    );
};

export default PasswordTooltip;

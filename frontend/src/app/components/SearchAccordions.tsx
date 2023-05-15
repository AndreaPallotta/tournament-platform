import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Link as MuiLink,
    Typography,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { SearchResult } from '../types/search.types';

interface Props {
    list: SearchResult[];
}

const SearchAccordions = ({ list }: Props) => {

    return (
        <>
            {list.map(({ name, teams }: SearchResult, index: number) => (
                <Accordion key={index}>
                    <AccordionSummary
                        expandIcon={<ExpandCircleDownOutlinedIcon />}
                        aria-controls={`search-result-content${index}`}
                    >
                        <MuiLink
                            to={`/college/${name}`}
                            underline="hover"
                            sx={{
                                textDecoration: 'none',
                                color: 'black',
                            }}
                            component={Link}
                        >
                            <Typography variant="h4">{name}</Typography>
                        </MuiLink>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            {teams.length > 0 ? (
                                teams.map((teamName: string, index: number) => (
                                    <div key={index}>
                                        <ListItem disableGutters>
                                            <ListItemButton>
                                                <ListItemText
                                                    children={
                                                        <MuiLink
                                                            to={`/team/${teamName}`}
                                                            underline="hover"
                                                            sx={{
                                                                textDecoration:
                                                                    'none',
                                                                color: 'black',
                                                            }}
                                                            component={Link}
                                                        >
                                                            <Typography variant="bold-small">
                                                                {teamName}
                                                            </Typography>
                                                        </MuiLink>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                        {index + 1 < teams.length && (
                                            <Divider />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <Typography variant="body2">
                                    This college does not have any teams
                                    associated with it
                                </Typography>
                            )}
                        </List>
                    </AccordionDetails>
                </Accordion>
            ))}
        </>
    );
};

export default SearchAccordions;

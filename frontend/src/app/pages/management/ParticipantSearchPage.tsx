/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Divider, Stack, Typography } from '@mui/material';
import React from 'react';
import SearchAccordions from 'src/app/components/SearchAccordions';
import SearchBar from 'src/app/components/SearchBar';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { get } from 'src/app/services/api.service';
import { SearchResult } from 'src/app/types/search.types';

const ParticipantSearchPage = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isSearching, setIsSearching] = React.useState(false);
    const [results, setResults] = React.useState<SearchResult[]>([]);

    const openNotification = useOpenNotification();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setIsSearching(true);
    };

    const handleClear = () => {
        setSearchTerm('');
        setIsSearching(true);
    };

    const handleSearch = async () => {
        const { res, err } = await get('/api/search/participants', {
            searchTerm,
        });

        if (err || !res || !res.results) {
            openNotification(err || 'Error searching', 'error');
            setResults([]);
        }

        if (res && res.results) {
            if (!res.results.length) {
                openNotification('No colleges found', 'warning');
            }
            setResults(getSortedResults(res.results as SearchResult[]));
        }

        setIsSearching(false);
    };

    const getSortedResults = (list: SearchResult[]) => {
        return list.sort((a: SearchResult, b: SearchResult) =>
            a.name.localeCompare(b.name)
        );
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (isSearching) {
                handleSearch();
            }
        }, 400);

        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);

    React.useEffect(() => {
        handleSearch();
    }, []);

    return (
        <Box px="3.5rem">
            <Stack spacing={3} my={5} sx={{ bg: 'lightgray' }}>
                <Typography variant="bold-title">Participants</Typography>

                <SearchBar
                    label="Search for colleges"
                    value={searchTerm}
                    onChange={handleChange}
                    onClear={handleClear}
                    onSubmit={handleSearch}
                />

                <Divider />

                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Colleges
                </Typography>

                <SearchAccordions list={results} />
            </Stack>
        </Box>
    );
};

export default ParticipantSearchPage;

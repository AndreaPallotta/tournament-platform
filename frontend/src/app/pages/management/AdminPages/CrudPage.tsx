import HelpIcon from '@mui/icons-material/Help';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from 'react';
import TerminalBox from '../../../components/TerminalBox';
import { useOpenNotification } from '../../../hooks/useNotification';
import { post } from '../../../services/api.service';

const operations = ['READ', 'UPDATE', 'CREATE', 'DELETE'];
const models = ['USER', 'COLLEGE', 'TEAM', 'GAME', 'TOURNAMENT'];
const keywords = ['WHERE', 'SET', 'FIRST', 'ALL'];

const TooltipHelper = () => (
    <>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Available query operations:
            <br />
            keywords are case-insensitive:
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
            <br />
            SELECT: read &lt;Model&gt; [FIRST|ALL] WHERE
            &lt;where_conditions&gt;
            <br />
            Example: read User FIRST WHERE id="12345"
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
            CREATE: create &lt;Model&gt; &lt;field_values&gt;
            <br />
            Example: create User name="John Doe" age="30"
            email="john.doe@example.com"
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
            UPDATE: update &lt;Model&gt; SET &lt;field_values&gt; WHERE
            &lt;where_conditions&gt;
            <br />
            Example: update User SET name="Jane Doe" AND age="35" WHERE
            id="12345"
        </Typography>
        <Typography variant="body1">
            DELETE: delete &lt;Model&gt; WHERE &lt;where_conditions&gt;
            <br />
            Example: delete User WHERE email="john.doe@example.com"
        </Typography>
    </>
);

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 500,
    },
});

const CrudPage = () => {
    const [query, setQuery] = React.useState('');
    const [output, setOutput] = React.useState('');
    const [isError, setIsError] = React.useState(false);

    const openNotification = useOpenNotification();

    const handleSetQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setQuery(value);
    };

    const handleClear = () => {
        setQuery('');
        setOutput('');
    };

    const handleQuery = async () => {
        const { res, err } = await post('/api/admin/crud', { query });

        if (err) {
            openNotification(err, 'error');
            setOutput(err);
            setIsError(true);
        }

        if (!res || !res?.result) {
            setIsError(true);
            setOutput('Error during database querying');
            return;
        }

        openNotification('Query successful', 'success');
        setIsError(false);
        setOutput(res.result);
    };

    const suggestions = [...operations, ...models, ...keywords].filter((word) =>
        (word as string)
            .toLowerCase()
            .startsWith(query.split(' ')[0].toLowerCase())
    );

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Database Queries
                <CustomWidthTooltip
                    title={<TooltipHelper />}
                    placement="top"
                    arrow
                >
                    <HelpIcon fontSize="small" sx={{ ml: 1 }} />
                </CustomWidthTooltip>
            </Typography>
            <Autocomplete
                freeSolo
                disableClearable
                options={suggestions}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        fullWidth
                        name="query"
                        label="Enter query here"
                        multiline
                        variant="outlined"
                        value={query}
                        sx={{ mb: 2 }}
                        onChange={handleSetQuery}
                    />
                )}
            />
            <Button variant="contained" sx={{ mr: 2 }} onClick={handleQuery}>
                Execute
            </Button>
            <Button variant="outlined" onClick={handleClear}>
                Clear
            </Button>
            {output && <TerminalBox content={output} isError={isError} />}
        </Box>
    );
};

export default CrudPage;

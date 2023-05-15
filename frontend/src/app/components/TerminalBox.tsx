import { Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import React from 'react';

interface ITerminalBox {
    content: string | object;
    isError?: boolean;
}

const TerminalBox = ({ content, isError = false }: ITerminalBox) => {
    const [isLoading, setIsLoading] = React.useState(false);

    const formatContent = () => {
        if (typeof content === 'string') {
            return `> ${content}`;
        }
        return JSON.stringify(content, null, 2);
    };

    React.useEffect(() => {
        if (isError) setIsLoading(false);
        try {
            setIsLoading(!content);
        } catch (err) {
            setIsLoading(false);
        }
    }, [content, isError]);

    return isLoading ? (
        <Skeleton
            variant="rectangular"
            sx={{
                mt: 2,
                px: 2,
                py: 5,
                backgroundColor: 'gray',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                lineHeight: 1.2,
                maxHeight: '60vh',
                maxWidth: '80vw',
            }}
        />
    ) : (
        <Paper
            sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'black',
                color: isError ? 'red' : 'white',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                lineHeight: 1.2,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                maxHeight: '60vh',
                overflow: 'auto',
                overflowX: 'auto',
                maxWidth: '80vw',
                wordBreak: 'break-all',
            }}
        >
            <pre>{formatContent()}</pre>
        </Paper>
    );
};

export default TerminalBox;

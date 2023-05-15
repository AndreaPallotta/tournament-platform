import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { IconButton, InputAdornment, SxProps, TextField } from '@mui/material';
import React from 'react';

interface Props {
    label?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    onSubmit: () => void;
    aria?: string;
    sx?: SxProps;
}

const SearchBar = (props: Props) => {
    const {
        value,
        onChange,
        onClear,
        onSubmit,
        aria,
        label,
        sx = { width: '100%' },
    } = props;

    return (
        <TextField
            label={label || 'Search'}
            value={value}
            onChange={onChange}
            sx={sx}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        {value.trim().length > 0 && (
                            <IconButton
                                onClick={onClear}
                                aria-label={`clear-${aria}`}
                            >
                                <CancelOutlinedIcon />
                            </IconButton>
                        )}
                        <IconButton
                            onClick={onSubmit}
                            aria-label={`submit-${aria}`}
                            disabled={!value.trim().length}
                        >
                            <SearchOutlinedIcon />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default SearchBar;

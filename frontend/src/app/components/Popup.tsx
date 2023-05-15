import { Popover, PopoverOrigin } from '@mui/material';

interface IPopupProps {
    anchorEl: HTMLElement | null;
    onClose:
        | ((event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void)
        | undefined;
    interactable?: boolean;
    open?: boolean;
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement> | undefined;
    position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
    children?: React.ReactNode;
}

type Position = {
    [key: string]: PopoverOrigin;
};

// anchorOrigins and transformOrigins "vertical" and "horizontal" values have to be opposite of
// each other in order to display in the intended corner (i.e. the top right, the top left, etc.)
const anchorOrigins: Position = {
    topRight: {
        vertical: 'top',
        horizontal: 'right',
    },
    topLeft: {
        vertical: 'top',
        horizontal: 'left',
    },
    bottomRight: {
        vertical: 'bottom',
        horizontal: 'right',
    },
    bottomLeft: {
        vertical: 'bottom',
        horizontal: 'left',
    },
};

const transformOrigins: Position = {
    topRight: {
        vertical: 'bottom',
        horizontal: 'left',
    },
    topLeft: {
        vertical: 'bottom',
        horizontal: 'right',
    },
    bottomRight: {
        vertical: 'top',
        horizontal: 'left',
    },
    bottomLeft: {
        vertical: 'top',
        horizontal: 'right',
    },
};

/**
 * Popup component for displaying an information box near an element.
 *
 * @param {IPopupProps} {
 *     anchorEl,
 *     onClose,
 *     interactable = false,
 *     open = false,
 *     onMouseLeave,
 *     position = 'topRight',
 *     children,
 * }
 */
const Popup = ({
    anchorEl,
    onClose,
    interactable = false,
    open = false,
    onMouseLeave,
    position = 'topRight',
    children,
}: IPopupProps) => {
    return (
        <Popover
            id="current-popover"
            sx={{
                pointerEvents: interactable ? 'auto' : 'none',
                userSelect: interactable ? 'auto' : 'none',
                '& .MuiPopover-paper': {
                    width: '460px',
                    maxHeight: '500px',
                    overflowY: 'scroll',
                    border: '1px solid #797979',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    padding: '32px',
                    wordWrap: 'break-word',
                },
            }}
            open={open && Boolean(anchorEl)}
            anchorEl={anchorEl}
            anchorOrigin={anchorOrigins[position]}
            transformOrigin={transformOrigins[position]}
            disableRestoreFocus
            onMouseLeave={onMouseLeave}
            onClose={onClose}
        >
            {children || null}
        </Popover>
    );
};

export default Popup;

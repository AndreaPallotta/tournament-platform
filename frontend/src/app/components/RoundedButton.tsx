import { Button, SxProps } from '@mui/material';

export interface RoundedButtonProps {
    text: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    borderColor?: string;
    backgroundColor?: string;
    color?: string;
    size?: 'small' | 'medium' | 'large';
    type?: 'button' | 'reset' | 'submit' | undefined;
    disabled?: boolean;
    startIcon?: JSX.Element;
    big?: boolean;
    sx?: SxProps;
    [key: string]: any;
}

/**
 * Rounded buttons to be used mostly on our pages which can be edited. See highlighted (in red) component
 * in high-fi figma files here: (https://www.figma.com/file/TfQA6rfaAA8vpnCGHXAC0b/senior-dev?node-id=712%3A1335&t=kIB6ban15TElEgFt-0).
 */
function RoundedButton({
    text = 'Button',
    onClick,
    borderColor = 'white',
    backgroundColor = 'white',
    color = 'black',
    size = 'large',
    type = 'button',
    disabled = false,
    startIcon = undefined,
    big = false,
    sx,
    ...props
}: RoundedButtonProps) {
    return (
        <Button
            variant="outlined"
            startIcon={startIcon}
            sx={{
                borderRadius: '50px',
                border: `1px solid ${borderColor}`,
                height: 'fit-content',
                boxShadow: 1,
                width: big ? '215px' : 'fit-content',
                whiteSpace: 'nowrap',
                backgroundColor,
                color,
                textTransform: 'none',
                ':hover': {
                    opacity: 1,
                    backgroundColor,
                },
                ...sx,
            }}
            size={size}
            type={type}
            disabled={disabled}
            onClick={onClick}
            disableRipple
            {...props}
        >
            {text}
        </Button>
    );
}

export const RoundedButtonText = ({
    text = 'Button',
    onClick,
    color = 'black',
    size = 'large',
    type = 'button',
    disabled = false,
    startIcon = undefined,
    big = false,
    sx,
    ...props
}: RoundedButtonProps) => {
    return (
        <Button
            variant="text"
            sx={{
                borderRadius: '50px',
                height: 'fit-content',
                width: big ? '215px' : 'fit-content',
                whiteSpace: 'nowrap',
                color,
                textTransform: 'none',
                ':hover': {
                    opacity: 1,
                },
                ...sx,
            }}
            size={size}
            type={type}
            disabled={disabled}
            onClick={onClick}
            disableRipple
            {...props}
        >
            {text}
        </Button>
    );
};

export default RoundedButton;

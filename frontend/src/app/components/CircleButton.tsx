import { IconButton, SxProps } from '@mui/material';

interface CircleButtonProps {
    icon: JSX.Element;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    borderColor?: string;
    backgroundColor?: string;
    size?: 'large' | 'small' | 'medium' | undefined;
    type?: 'button' | 'reset' | 'submit' | undefined;
    disabled?: boolean;
    sx?: SxProps;
    [key: string]: any;
}

/**
 * Circular buttons which just contain icons and no text.s
 *
 * @param {CircleButtonProps} {
 *     icon,
 *     onClick,
 *     borderColor = 'white',
 *     backgroundColor = 'white',
 *     size = 'large',
 *     type = 'button',
 *     disabled = false,
 *     sx,
 *     ...props
 * }
 * @return {*}
 */
function CircleButton({
    icon,
    onClick,
    borderColor = 'white',
    backgroundColor = 'white',
    size = 'large',
    type = 'button',
    disabled = false,
    sx,
    ...props
}: CircleButtonProps) {
    return (
        <IconButton
            onClick={onClick}
            sx={{
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                border: `1px solid ${backgroundColor}`,
                ':hover': {
                    border: '1px solid #1976d2',
                    backgroundColor: backgroundColor,
                    opacity: 1,
                },
                ...sx,
            }}
            size={size}
            type={type}
            disabled={disabled}
            {...props}
        >
            {icon}
        </IconButton>
    );
}
export default CircleButton;

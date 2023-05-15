import { Card, CardContent, SxProps, Typography } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { formatNumberLiteral } from '../services/utils.service';

interface Props {
    title: string;
    value: string | number;
    useAbbreviation?: boolean;
    sx?: SxProps;
    variant?: Variant | undefined;
}

const DataCard = ({
    title,
    value,
    sx,
    useAbbreviation = false,
    variant = 'body1',
}: Props) => {
    return (
        <Card sx={sx}>
            <CardContent sx={{ ml: 1, mt: 1 }}>
                <Typography
                    fontWeight="bold"
                    color="red"
                    variant={variant}
                    pb={2}
                >
                    {title}
                </Typography>
                <Typography variant="h3">
                    {useAbbreviation ? formatNumberLiteral(value) : value}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default DataCard;

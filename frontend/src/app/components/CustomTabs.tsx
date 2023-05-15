import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React from 'react';
import { TabElementProps } from '../types/comp.types';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface CustomTabsProps {
    tabValue?: number;
    onChange?: (event: React.SyntheticEvent, newValue: number) => void;
    ariaLabel: string;
    props: TabElementProps[];
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

const a11yProps = (index: number) => ({
    id: `custom-tab-${index}`,
    'aria-controls': `custom-tabpanel-${index}`,
});

const CustomTabs = ({
    tabValue,
    onChange,
    ariaLabel,
    props,
}: CustomTabsProps) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        if (typeof onChange === 'function') {
            onChange(event, newValue);
        }
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={tabValue ?? value}
                    onChange={handleChange}
                    aria-label={ariaLabel}
                    centered
                >
                    {props.map(({ label }: TabElementProps, index: number) => (
                        <Tab key={index} label={label} {...a11yProps(index)} />
                    ))}
                </Tabs>
            </Box>
            {props.map(({ content }: TabElementProps, index: number) => (
                <TabPanel key={index} value={tabValue ?? value} index={index}>
                    {content}
                </TabPanel>
            ))}
        </Box>
    );
};

export default CustomTabs;

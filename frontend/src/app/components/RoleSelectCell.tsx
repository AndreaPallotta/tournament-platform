import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React, { useEffect } from 'react';
import { UserTableRecord } from '../types/admin.types';
import { Role } from '../types/enums';

interface RoleCellProps {
    value: string;
    rowId: number;
    changedRoles: UserTableRecord[];
    onChange: (rowId: number, newRole: Role) => void;
}

type BackgroundColor = 'white' | 'lightgreen';

const RoleCell = ({ value, rowId, onChange, changedRoles }: RoleCellProps) => {
    const [selectedRole, setSelectedRole] = React.useState<Role>(value as Role);
    const [backgroundColor, setBackgroundColor] =
        React.useState<BackgroundColor>('white');

    const handleRoleChange = (event: SelectChangeEvent) => {
        const newRole = event.target.value as Role;
        setSelectedRole(newRole);
        onChange(rowId, newRole);

        setBackgroundColor('lightgreen');
    };

    useEffect(() => {
        if (changedRoles.length === 0) {
            setBackgroundColor('white');
        }
    }, [changedRoles]);

    return (
        <span style={{ backgroundColor, width: '100%' }}>
            <Select
                sx={{
                    boxShadow: 'none',
                    '.MuiOutlinedInput-notchedOutline': { border: 0 },
                }}
                fullWidth
                value={selectedRole}
                onChange={handleRoleChange}
            >
                {Object.values(Role).map((role: Role) => (
                    <MenuItem key={role} value={role}>
                        {role}
                    </MenuItem>
                ))}
            </Select>
        </span>
    );
};

export default RoleCell;

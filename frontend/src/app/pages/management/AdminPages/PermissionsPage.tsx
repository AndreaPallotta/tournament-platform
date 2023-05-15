/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { Stack } from '@mui/system';
import {
    DataGrid,
    GridColDef,
    GridRowId,
    GridRowSelectionModel,
} from '@mui/x-data-grid';
import React from 'react';
import RoleCell from '../../../components/RoleSelectCell';
import { useOpenNotification } from '../../../hooks/useNotification';
import { get, post } from '../../../services/api.service';
import { RoleUpdateRes, UserTableRecord } from '../../../types/admin.types';
import { Role } from '../../../types/enums';

interface PaginationModel {
    page: number;
    pageSize: number;
}

const PermissionsPage = () => {
    const [data, setData] = React.useState<UserTableRecord[]>([]);
    const [paginationModel, setPaginationModel] =
        React.useState<PaginationModel>({
            page: 0,
            pageSize: 25,
        });
    const [totalRowCount, setTotalRowCount] = React.useState(0);
    const [updatedRows, setUpdatedRows] = React.useState<UserTableRecord[]>([]);
    const [rowsToDelete, setRowsToDelete] = React.useState<GridRowId[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const openNotification = useOpenNotification();

    const handleGetUsers = React.useCallback(async () => {
        setIsLoading(true);
        const { res, err } = await get('/api/admin/getUsers', paginationModel);

        if (err || !res?.users) {
            openNotification(err || 'Error retrieving users', 'error');
        }

        setData(res?.users || []);
        setTotalRowCount(res?.totalRowCount || 0);
        setIsLoading(false);
    }, [openNotification, paginationModel]);

    const onRowUpdate = (rowId: number, newValue: Role) => {
        const editedUser = {
            id: rowId,
            role: newValue as string,
        } as unknown as UserTableRecord;
        setUpdatedRows((prevState: UserTableRecord[]) => [
            ...prevState,
            editedUser,
        ]);
    };

    const handleClear = () => {
        setUpdatedRows([]);
    };

    const handleSave = async () => {
        const { err, res } = await post('/api/admin/updateRoles', {
            roles: updatedRows,
        });

        if (err || !res?.msg) {
            openNotification(err || 'Error updating roles', 'error');
        }

        const { success, errors } = res as RoleUpdateRes;

        if (errors.count > 0) {
            openNotification(
                `Error updating ${errors.count}/${
                    updatedRows.length
                } roles: ${errors.ids.join(', ')}`,
                'warning'
            );
        } else {
            openNotification(
                `Successfully updated ${success}/${updatedRows.length} roles`,
                'success'
            );
        }

        setUpdatedRows((prevState: UserTableRecord[]) => [
            ...prevState.filter(({ id }: UserTableRecord) =>
                errors.ids.includes(id)
            ),
        ]);
    };

    const handleDelete = async () => {
        const { err, res } = await post('/api/admin/DeleteUsers', {
            ids: rowsToDelete,
        });

        if (err) {
            openNotification(err, 'error');
        }

        if (res) {
            if (res.deletedUsersCount === rowsToDelete.length) {
                openNotification(
                    `Successfully deleted ${res.deletedUsersCount}/${rowsToDelete.length} users`,
                    'success'
                );
            } else {
                openNotification(
                    `Deleted ${res.deletedUsersCount}/${rowsToDelete.length} users`,
                    'warning'
                );
            }

            setRowsToDelete([]);
            handleGetUsers();
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            headerAlign: 'center',
            flex: 1,
            editable: false,
            align: 'center',
        },
        {
            field: 'email',
            headerName: 'Email',
            headerAlign: 'center',
            flex: 1,
            editable: false,
            align: 'center',
        },
        {
            field: 'role',
            headerName: 'Role',
            headerAlign: 'center',
            flex: 1,
            editable: true,
            align: 'center',
            renderCell: (params) => (
                <RoleCell
                    value={params.value as Role}
                    onChange={onRowUpdate}
                    changedRoles={updatedRows}
                    rowId={params.id as number}
                />
            ),
        },
    ];

    React.useEffect(() => {
        handleGetUsers();
    }, [paginationModel]);

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={data}
                columns={columns}
                rowCount={totalRowCount}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                paginationMode="server"
                loading={isLoading}
                autoHeight
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
                onRowSelectionModelChange={(ids: GridRowSelectionModel) => {
                    setRowsToDelete(ids);
                }}
            />
            <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 5, justifyContent: 'flex-end', gap: 2 }}
            >
                {rowsToDelete.length > 0 && (
                    <Box sx={{ flexGrow: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleDelete}
                            sx={{ ml: 'auto' }}
                        >
                            Delete
                        </Button>
                    </Box>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={updatedRows.length === 0}
                >
                    Save
                </Button>
                <Button
                    variant="text"
                    onClick={handleClear}
                    disabled={updatedRows.length === 0}
                >
                    Clear
                </Button>
            </Stack>
        </Box>
    );
};

export default PermissionsPage;

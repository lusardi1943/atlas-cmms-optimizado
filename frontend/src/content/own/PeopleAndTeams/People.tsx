import {
  Box,
  debounce,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../components/CustomDatagrid';
import {
  GridActionsCellItem,
  GridEnrichedColDef,
  GridRenderCellParams,
  GridRowParams,
  GridToolbar,
  GridValueGetterParams
} from '@mui/x-data-grid';
import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import UserDetailsDrawer from './UserDetailsDrawer';
import User from '../../../models/owns/user';
import { useParams } from 'react-router-dom';
import { isNumeric } from 'src/utils/validators';
import { useDispatch, useSelector } from '../../../store';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import {
  clearSingleUser,
  disableUser,
  editUser,
  editUserRole,
  enableUser,
  getSingleUser,
  getUsers,
  softDeleteUser
} from '../../../slices/user';
import { OwnUser } from '../../../models/user';
import { PermissionEntity, Role } from '../../../models/owns/role';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import CheckCircleOutlineTwoToneIcon from '@mui/icons-material/CheckCircleOutlineTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import useAuth from '../../../hooks/useAuth';
import Form from '../components/form';
import * as Yup from 'yup';
import { IField } from '../type';
import { formatSelect } from '../../../utils/formatters';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { SearchCriteria, SortDirection } from '../../../models/owns/page';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import { onSearchQueryChange } from '../../../utils/overall';
import SearchInput from '../components/SearchInput';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ConfirmDialog from '../components/ConfirmDialog';
import { useGridApiRef } from '@mui/x-data-grid-pro';
import useGridStatePersist from '../../../hooks/useGridStatePersist';
import DeactivateUserDialog from './components/DeactivateUserDialog';
import {
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
  Tooltip,
  Button
} from '@mui/material';
import InviteUserDialog from './components/InviteUserDialog';
import { isEmailVerificationEnabled } from '../../../config';

interface PropsType {
  values?: any;
  openModal: boolean;
  handleCloseModal: () => void;
}

const People = ({ openModal, handleCloseModal }: PropsType) => {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<OwnUser>();
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const { peopleId } = useParams();
  const { hasEditPermission, user } = useAuth();
  const { users, loadingGet, singleUser } = useSelector((state) => state.users);
  const [openDrawerFromUrl, setOpenDrawerFromUrl] = useState<boolean>(false);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    filterFields: [
      {
        field: 'enabled',
        operation: 'eq',
        value: true
      }
    ],
    pageSize: 10,
    pageNum: 0,
    direction: 'DESC'
  });
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { getFormattedCurrency, getFormattedDate } = useContext(
    CompanySettingsContext
  );
  const [showOnlyEnabled, setShowOnlyEnabled] = useState<boolean>(true);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [openDisableModal, setOpenDisableModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  const onQueryChange = (event) => {
    onSearchQueryChange<User>(event, criteria, setCriteria, [
      'firstName',
      'lastName',
      'email',
      'phone',
      'jobTitle'
    ]);
  };
  const debouncedQueryChange = useMemo(() => debounce(onQueryChange, 1300), []);

  const onEditSuccess = () => {
    setOpenUpdateModal(false);
    showSnackBar(t('changes_saved_success'), 'success');
  };
  const onEditFailure = (err) =>
    showSnackBar(t("The User couldn't be edited"), 'error');

  const handleOpenDrawer = (user: OwnUser) => {
    setCurrentUser(user);
    window.history.replaceState(
      null,
      'User details',
      `/app/people-teams/people/${user.id}`
    );
    setDetailDrawerOpen(true);
  };
  const handleOpenDetails = (id: number) => {
    const foundUser = users.content.find((user) => user.id === id);
    if (foundUser) {
      handleOpenDrawer(foundUser);
    }
  };
  const handleOpenUpdate = (id: number) => {
    const foundUser = users.content.find((user) => user.id === id);
    if (foundUser) {
      setCurrentUser(foundUser);
      setOpenUpdateModal(true);
    }
  };
  const handleOpenDisable = (id: number) => {
    const foundUser = users.content.find((user) => user.id === id);
    if (foundUser) {
      setCurrentUser(foundUser);
      setOpenDisableModal(true);
    }
  };
  const handleOpenDelete = (id: number) => {
    const foundUser = users.content.find((user) => user.id === id);
    if (foundUser) {
      setCurrentUser(foundUser);
      setOpenDeleteModal(true);
    }
  };
  const handleCloseDetails = () => {
    window.history.replaceState(null, 'User', `/app/people-teams/people`);
    setDetailDrawerOpen(false);
  };
  const defautfields: Array<IField> = [
    {
      name: 'rate',
      type: 'number',
      label: t('hourly_rate')
    },
    {
      name: 'email',
      type: 'text',
      label: t('email')
    },
    {
      name: 'role',
      type: 'select',
      type2: 'role',
      label: t('role')
    },
    ...(isEmailVerificationEnabled
      ? []
      : [
        {
          name: 'password',
          type: 'text',
          label: t('password_leave_empty_if_you_dont_want_to_change')
        } as IField
      ])
  ];
  const getFields = () => {
    let fields = [...defautfields];
    if (currentUser?.ownsCompany || currentUser?.id === user?.id) {
      fields = fields.filter(
        (field) => !['role', 'password'].includes(field.name)
      );
    }
    return fields;
  };
  const renderEditUserModal = () => (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openUpdateModal}
      onClose={() => setOpenUpdateModal(false)}
    >
      <DialogTitle
        sx={{
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('edit_user')}
        </Typography>
        <Typography variant="subtitle2">
          {t('edit_user_description')}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={getFields()}
            validation={Yup.object().shape({
              password: Yup.string().min(8, t('invalid_password')).nullable(),
              email: Yup.string()
                .email(t('invalid_email'))
                .required(t('required_email'))
            })}
            submitText={t('save')}
            values={{
              rate: currentUser?.rate,
              role: currentUser
                ? {
                  label:
                    currentUser.role.code === 'USER_CREATED'
                      ? currentUser.role.name
                      : t(`${currentUser.role.code}_name`),
                  value: currentUser.role.id
                }
                : null,
              password: null,
              email: currentUser?.email
            }}
            onChange={({ field, e }) => { }}
            onSubmit={async (values) => {
              return dispatch(
                editUser(currentUser.id, {
                  ...currentUser,
                  rate: values.rate ?? currentUser.rate,
                  email: values.email ?? currentUser.email,
                  newPassword: values.password ?? null
                })
              )
                .then(
                  () =>
                    formatSelect(values.role).id !== currentUser.role.id &&
                    dispatch(
                      editUserRole(currentUser.id, formatSelect(values.role).id)
                    )
                )
                .then(onEditSuccess)
                .catch(onEditFailure);
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
  // if reload with peopleId
  useEffect(() => {
    if (peopleId && isNumeric(peopleId)) {
      dispatch(getSingleUser(Number(peopleId)));
    }
  }, [peopleId]);

  useEffect(() => {
    setCriteria(prevCriteria => {
      let newFilterFields = prevCriteria.filterFields.filter(ff => ff.field !== 'enabled');
      newFilterFields.push({
        field: 'enabled',
        operation: 'eq',
        value: showOnlyEnabled
      });
      return {
        ...prevCriteria,
        filterFields: newFilterFields
      };
    });
  }, [showOnlyEnabled]);

  useEffect(() => {
    dispatch(getUsers(criteria));
  }, [criteria]);
  //see changes in ui on edit
  useEffect(() => {
    if (singleUser || users.content.length) {
      const currentInContent = users.content.find(
        (user) => user.id === currentUser?.id
      );
      const updatedUser = currentInContent ?? singleUser;
      if (updatedUser) {
        if (openDrawerFromUrl) {
          setCurrentUser(updatedUser);
        } else {
          handleOpenDrawer(updatedUser);
          setOpenDrawerFromUrl(true);
        }
      }
    }
    return () => {
      dispatch(clearSingleUser());
    };
  }, [singleUser, users]);

  const onPageSizeChange = (size: number) => {
    setCriteria({ ...criteria, pageSize: size });
  };
  const onPageChange = (number: number) => {
    setCriteria({ ...criteria, pageNum: number });
  };

  // let fields: Array<IField> = [];

  // const shape = {};

  const columns: GridEnrichedColDef[] = [
    {
      field: 'name',
      headerName: t('name'),
      width: 150,
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Box sx={{ fontWeight: 'bold' }}>{params.value}</Box>
      )
    },
    {
      field: 'email',
      headerName: t('email'),
      width: 150
    },
    {
      field: 'phone',
      headerName: t('phone'),
      width: 150
    },
    {
      field: 'jobTitle',
      headerName: t('job_title'),
      width: 150
    },
    {
      field: 'role',
      headerName: t('role'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<Role>) =>
        params.value.code === 'USER_CREATED'
          ? params.value.name
          : t(`${params.value.code}_name`)
    },
    {
      field: 'rate',
      headerName: t('hourly_rate'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<number>) =>
        getFormattedCurrency(params.value)
    },
    {
      field: 'lastLogin',
      headerName: t('last_login'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<string>) =>
        getFormattedDate(params.value)
    },
    {
      field: 'deactivatedUntil',
      headerName: t('deactivated_until'),
      width: 170,
      valueGetter: (params: GridValueGetterParams<string>) =>
        params.row.enabled ? '-' : getFormattedDate(params.value)
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions'),
      description: t('actions'),
      getActions: (params: GridRowParams<OwnUser>) => {
        let actions = [
          <GridActionsCellItem
            key="edit"
            icon={<EditTwoToneIcon fontSize="small" color={'primary'} />}
            onClick={() => handleOpenUpdate(Number(params.id))}
            label={t('edit')}
          />,
          ...(params.row.enabled && !params.row.ownsCompany
            ? [
              <GridActionsCellItem
                key="disable"
                icon={<CancelIcon fontSize="small" color={'error'} />}
                onClick={() => handleOpenDisable(Number(params.id))}
                label={t('disable')}
              />,
              <GridActionsCellItem
                key="delete"
                icon={<DeleteTwoToneIcon fontSize="small" color={'error'} />}
                onClick={() => handleOpenDelete(Number(params.id))}
                label={t('delete')}
              />
            ]
            : []),
          ...(!params.row.enabled
            ? [
              <GridActionsCellItem
                key="enable"
                icon={
                  <CheckCircleOutlineTwoToneIcon
                    fontSize="small"
                    color={'primary'}
                  />
                }
                onClick={() => {
                  dispatch(enableUser(Number(params.id))).then(() => {
                    showSnackBar(t('user_enabled_success'), 'success');
                  });
                }}
                label={t('enable')}
              />
            ]
            : [])
        ];
        if (!hasEditPermission(PermissionEntity.PEOPLE_AND_TEAMS, params.row))
          actions = [];
        return actions;
      }
    }
  ];
  const apiRef = useGridApiRef();
  useGridStatePersist(apiRef, columns, 'users');
  const RenderPeopleList = () => (
    <CustomDataGrid
      {...({ apiRef } as any)}
      pageSize={criteria.pageSize}
      page={criteria.pageNum}
      rows={users.content}
      rowCount={users.totalElements}
      pagination
      paginationMode="server"
      sortingMode="server"
      onPageSizeChange={onPageSizeChange}
      onPageChange={onPageChange}
      rowsPerPageOptions={[10, 20, 50]}
      loading={loadingGet}
      onSortModelChange={(model) => {
        if (model.length === 0) {
          setCriteria({
            ...criteria,
            sortField: undefined,
            direction: undefined
          });
          return;
        }

        const fieldMapping = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'email',
          rate: 'rate',
          role: 'role.name'
        };

        const field = model[0].field;
        const mappedField = fieldMapping[field];

        if (!mappedField) return;

        setCriteria({
          ...criteria,
          sortField: mappedField,
          direction: (model[0].sort?.toUpperCase() || 'ASC') as SortDirection
        });
      }}
      columns={columns}
      components={{
        Toolbar: GridToolbar
      }}
      initialState={{
        columns: {
          columnVisibilityModel: {}
        }
      }}
      onRowClick={(params) => {
        // setCurrentUser(users.find((user) => user.id === params.id));
        handleOpenDetails(Number(params.id));
      }}
    />
  );

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <Stack
        direction="row"
        width="95%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box sx={{ my: 0.5 }}>
          <SearchInput onChange={debouncedQueryChange} />
        </Box>
        <Box display="flex" alignItems="center">
          <FormGroup sx={{ mr: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!showOnlyEnabled}
                  onChange={(e) => setShowOnlyEnabled(!e.target.checked)}
                />
              }
              label={t('show_disabled_users')}
            />
          </FormGroup>
          <Button
            sx={{
              mt: { xs: 2, sm: 0 }
            }}
            onClick={() => setOpenUpdateModal(true)}
            variant="contained"
            startIcon={<AddTwoToneIcon fontSize="small" />}
          >
            {t('people')}
          </Button>
        </Box>
      </Stack>
      {RenderPeopleList()}

      <Drawer
        variant="temporary"
        anchor={theme.direction === 'rtl' ? 'left' : 'right'}
        open={detailDrawerOpen}
        onClose={handleCloseDetails}
        elevation={9}
      >
        <UserDetailsDrawer user={currentUser} />
      </Drawer>

      <InviteUserDialog
        open={openModal}
        onClose={handleCloseModal}
        onRefreshUsers={() => {
          dispatch(getUsers(criteria));
        }}
      />
      <DeactivateUserDialog
        open={openDisableModal}
        onClose={() => setOpenDisableModal(false)}
        user={currentUser}
        onSuccess={() => {
          showSnackBar(t('user_disabled_success'), 'success');
          dispatch(getUsers(criteria));
        }}
      />
      <ConfirmDialog
        open={openDeleteModal}
        onCancel={() => {
          setOpenDeleteModal(false);
        }}
        onConfirm={() => {
          dispatch(softDeleteUser(currentUser.id)).then(() => {
            setOpenDeleteModal(false);
            showSnackBar(t('user_deleted_success'), 'success');
          });
        }}
        confirmText={t('delete')}
        question={t('confirm_delete_user', {
          user: `${currentUser?.firstName} ${currentUser?.lastName}`
        })}
      />
      {renderEditUserModal()}
    </Box>
  );
};

export default People;

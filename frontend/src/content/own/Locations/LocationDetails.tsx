import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
  Collapse
} from '@mui/material';
import Location from '../../../models/owns/location';
import { ChangeEvent, useContext, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Form from '../components/form';
import * as Yup from 'yup';
import { IField } from '../type';
import { useDispatch, useSelector } from '../../../store';
import { AssetDTO } from '../../../models/owns/asset';
import { getAssetsByLocation } from '../../../slices/asset';
import { useNavigate } from 'react-router-dom';
import { getWorkOrdersByLocation } from '../../../slices/workOrder';
import {
  createFloorPlan,
  deleteFloorPlan,
  getFloorPlans
} from '../../../slices/floorPlan';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { getAssetUrl } from '../../../utils/urlPaths';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import { PlanFeature } from '../../../models/owns/subscriptionPlan';

interface LocationDetailsProps {
  location: Location;
  handleOpenUpdate: () => void;
  handleOpenDelete: () => void;
}

interface AssetTreeNode extends AssetDTO {
  children: AssetTreeNode[];
}

interface AssetHierarchyItemProps {
  asset: AssetTreeNode;
  level: number;
}

const AssetHierarchyItem = ({ asset, level }: AssetHierarchyItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const navigate = useNavigate();

  const hasChildren = asset.children.length > 0;

  return (
    <>
      <ListItemButton
        divider
        onClick={() => navigate(getAssetUrl(asset.id))}
        sx={{ pl: level * 4 + 2 }}
      >
        <Box display="flex" alignItems="center" width="100%">
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              sx={{ mr: 1 }}
            >
              {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          ) : (
            <Box sx={{ width: 34, mr: 1 }} />
          )}
          <ListItemText
            primary={asset.name}
            secondary={getFormattedDate(asset.createdAt)}
          />
        </Box>
      </ListItemButton>
      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {asset.children.map((child) => (
              <AssetHierarchyItem
                key={child.id}
                asset={child}
                level={level + 1}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};
export default function LocationDetails(props: LocationDetailsProps) {
  const { location, handleOpenUpdate, handleOpenDelete } = props;
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { getFormattedDate, uploadFiles } = useContext(CompanySettingsContext);
  const [openAddFloorPlan, setOpenAddFloorPlan] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('assets');
  const { assetsByLocation } = useSelector((state) => state.assets);
  const { workOrdersByLocation } = useSelector((state) => state.workOrders);
  const { floorPlansByLocation } = useSelector((state) => state.floorPlans);
  const {
    hasEditPermission,
    hasDeletePermission,
    getFilteredFields,
    hasCreatePermission,
    hasFeature
  } = useAuth();
  const locationAssets = assetsByLocation[location.id] ?? [];
  const locationWorkOrders = workOrdersByLocation[location.id] ?? [];
  const floorPlans = floorPlansByLocation[location.id] ?? [];
  const theme = useTheme();
  const navigate = useNavigate();
  const tabs = [
    { value: 'assets', label: t('assets') },
    { value: 'files', label: t('files') },
    { value: 'workOrders', label: t('work_orders') },
    { value: 'floorPlans', label: t('floor_plans') },
    { value: 'people', label: t('people') }
  ];

  const fields: Array<IField> = [
    {
      name: 'name',
      type: 'text',
      label: t('name'),
      placeholder: t('floor_plan_name_description'),
      required: true
    },
    {
      name: 'area',
      type: 'number',
      label: t('area'),
      placeholder: t('Floor plan area in m²')
    },
    {
      name: 'image',
      type: 'file',
      fileType: 'image',
      label: 'Image',
      placeholder: t('upload_image')
    }
  ];
  const floorPlanShape = {
    name: Yup.string().required(t('required_floor_plan_name'))
  };

  useEffect(() => {
    dispatch(getAssetsByLocation(location.id));
    dispatch(getWorkOrdersByLocation(location.id));
    dispatch(getFloorPlans(location.id));
  }, [location]);

  const renderAddFloorPlanModal = () => (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={openAddFloorPlan}
      onClose={() => setOpenAddFloorPlan(false)}
    >
      <DialogTitle
        sx={{
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('add_floor_plan')}
        </Typography>
        <Typography variant="subtitle2">
          {t('add_floor_plan_description')}
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
            fields={getFilteredFields(fields)}
            validation={Yup.object().shape(floorPlanShape)}
            submitText={t('add_floor_plan')}
            values={{}}
            onChange={({ field, e }) => { }}
            onSubmit={async (values) => {
              return new Promise<void>((resolve, rej) => {
                uploadFiles([], values.image)
                  .then((files) => {
                    values = {
                      ...values,
                      image: files.length ? { id: files[0].id } : null
                    };
                    dispatch(createFloorPlan(location.id, values))
                      .then(() => setOpenAddFloorPlan(false))
                      .finally(resolve);
                  })
                  .catch((err) => {
                    rej(err);
                  });
              });
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  const assetTree = useMemo(() => {
    const assets = [...locationAssets];
    // Sort all assets by name A-Z
    assets.sort((a, b) => a.name.localeCompare(b.name));

    const assetMap = new Map<number, AssetTreeNode>();
    assets.forEach((asset) => assetMap.set(asset.id, { ...asset, children: [] }));

    const roots: AssetTreeNode[] = [];
    assets.forEach((asset) => {
      const parentId = asset.parentAsset?.id;
      // If asset has a parent and that parent is also in the same location (and present in our map)
      if (parentId && assetMap.has(parentId)) {
        assetMap.get(parentId).children.push(assetMap.get(asset.id));
      } else {
        roots.push(assetMap.get(asset.id));
      }
    });

    return roots;
  }, [locationAssets]);
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="stretch"
      spacing={2}
      padding={4}
    >
      {renderAddFloorPlanModal()}
      <Grid
        item
        xs={12}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h2">{location?.name}</Typography>
          <Typography variant="h6">{location?.address}</Typography>
        </Box>
        <Box>
          {hasEditPermission(PermissionEntity.LOCATIONS, location) && (
            <IconButton onClick={handleOpenUpdate} style={{ marginRight: 10 }}>
              <EditTwoToneIcon color="primary" />
            </IconButton>
          )}
          {hasDeletePermission(PermissionEntity.LOCATIONS, location) && (
            <IconButton onClick={handleOpenDelete}>
              <DeleteTwoToneIcon color="error" />
            </IconButton>
          )}
        </Box>
      </Grid>
      <Divider />
      {location.image && (
        <Grid
          item
          xs={12}
          lg={12}
          display="flex"
          justifyContent="center"
          padding={2}
        >
          <img
            src={location.image.url}
            style={{ borderRadius: 5, height: 200 }}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <Tabs
          onChange={handleTabsChange}
          value={currentTab}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Grid>
      <Grid item xs={12}>
        {currentTab === 'assets' && (
          <Box>
            {hasCreatePermission(PermissionEntity.ASSETS) && (
              <Box display="flex" justifyContent="right">
                <Button
                  startIcon={<AddTwoToneIcon fontSize="small" />}
                  onClick={() =>
                    navigate(`/app/assets?location=${location.id}`)
                  }
                >
                  {t('asset')}
                </Button>
              </Box>
            )}
            {assetTree.length ? (
              <List disablePadding sx={{ width: '100%' }}>
                {assetTree.map((asset) => (
                  <AssetHierarchyItem key={asset.id} asset={asset} level={0} />
                ))}
              </List>
            ) : (
              <Stack direction="row" justifyContent="center" width="100%">
                <Typography variant="h5">
                  {t('no_asset_in_location')}
                </Typography>
              </Stack>
            )}
          </Box>
        )}
        {currentTab === 'workOrders' && (
          <Box>
            {hasCreatePermission(PermissionEntity.WORK_ORDERS) && (
              <Box display="flex" justifyContent="right">
                <Button
                  startIcon={<AddTwoToneIcon fontSize="small" />}
                  onClick={() =>
                    navigate(`/app/work-orders?location=${location.id}`)
                  }
                >
                  {t('work_order')}
                </Button>
              </Box>
            )}
            {locationWorkOrders.length ? (
              <List sx={{ width: '100%' }}>
                {locationWorkOrders.map((workOrder) => (
                  <ListItemButton
                    key={workOrder.id}
                    divider
                    onClick={() => navigate(`/app/work-orders/${workOrder.id}`)}
                  >
                    <ListItemText
                      primary={workOrder.title}
                      secondary={getFormattedDate(workOrder.createdAt)}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Stack direction="row" justifyContent="center" width="100%">
                <Typography variant="h5">{t('no_wo_in_location')}</Typography>
              </Stack>
            )}
          </Box>
        )}
        {currentTab === 'files' && (
          <Box>
            {hasCreatePermission(PermissionEntity.FILES) &&
              hasFeature(PlanFeature.FILE) && (
                <Box display="flex" justifyContent="right">
                  <Button
                    startIcon={<AddTwoToneIcon fontSize="small" />}
                    onClick={handleOpenUpdate}
                  >
                    {t('file')}
                  </Button>
                </Box>
              )}
            {location.files.length ? (
              <List sx={{ width: '100%' }}>
                {location.files.map((file) => (
                  <ListItemButton
                    key={file.id}
                    divider
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="h6" fontWeight="bold">
                          {file.name}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Stack direction="row" justifyContent="center" width="100%">
                <Typography variant="h5">{t('no_file_in_location')}</Typography>
              </Stack>
            )}
          </Box>
        )}
        {currentTab === 'floorPlans' && (
          <Box>
            {hasEditPermission(PermissionEntity.LOCATIONS, location) && (
              <Box display="flex" justifyContent="right">
                <Button
                  onClick={() => setOpenAddFloorPlan(true)}
                  startIcon={<AddTwoToneIcon fontSize="small" />}
                >
                  {t('floor_plan')}
                </Button>
              </Box>
            )}
            {floorPlans.length ? (
              <List sx={{ width: '100%' }}>
                {floorPlans.map((floorPlan) => (
                  <ListItemButton key={floorPlan.id} divider>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          sx={{ ml: 1 }}
                          onClick={() => {
                            if (
                              window.confirm(
                                t(
                                  "Are you sure you want to delete this Floor Plan. It can't be undone"
                                )
                              )
                            ) {
                              dispatch(
                                deleteFloorPlan(location.id, floorPlan.id)
                              );
                            }
                          }}
                        >
                          <DeleteTwoToneIcon fontSize="small" color="error" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={floorPlan.name}
                        secondary={`${floorPlan.area} m²`}
                      />
                    </ListItem>
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Stack direction="row" justifyContent="center" width="100%">
                <Typography variant="h5">
                  {t('no_floor_plan_in_location')}
                </Typography>
              </Stack>
            )}
          </Box>
        )}
        {currentTab === 'people' && (
          <Grid container>
            {!!location.workers.length && (
              <Grid item xs={12} lg={6}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.colors.alpha.black[70] }}
                >
                  {t('assigned_to')}
                </Typography>
                {location.workers.map((worker, index) => (
                  <Box key={worker.id}>
                    <Link
                      href={`/app/people-teams/people/${worker.id}`}
                      variant="h6"
                      fontWeight="bold"
                    >
                      {`${worker.firstName} ${worker.lastName}`}
                    </Link>
                  </Box>
                ))}
              </Grid>
            )}
            {!!location.teams.length && (
              <Grid item xs={12} lg={6}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.colors.alpha.black[70] }}
                >
                  {t('assigned_teams')}
                </Typography>
                {location.teams.map((team, index) => (
                  <Box key={team.id}>
                    <Link
                      href={`/app/people-teams/teams/${team.id}`}
                      variant="h6"
                      fontWeight="bold"
                    >
                      {team.name}
                    </Link>
                  </Box>
                ))}
              </Grid>
            )}
            {!!location.customers.length && (
              <Grid item xs={12} lg={6}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.colors.alpha.black[70] }}
                >
                  {t('assigned_customers')}
                </Typography>
                {location.customers.map((customer, index) => (
                  <Box key={customer.id}>
                    <Link
                      href={`/app/vendors-customers/customers/${customer.id}`}
                      variant="h6"
                      fontWeight="bold"
                    >
                      {customer.name}
                    </Link>
                  </Box>
                ))}
              </Grid>
            )}
            {!!location.vendors.length && (
              <Grid item xs={12} lg={6}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.colors.alpha.black[70] }}
                >
                  {t('assigned_vendors')}
                </Typography>
                {location.vendors.map((vendor, index) => (
                  <Box key={vendor.id}>
                    <Link
                      href={`/app/vendors-customers/vendors/${vendor.id}`}
                      variant="h6"
                      fontWeight="bold"
                    >
                      {vendor.companyName}
                    </Link>
                  </Box>
                ))}
              </Grid>
            )}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

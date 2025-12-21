import { EntityType, OwnHeader } from 'src/content/own/Imports';

export const getOwnHeadersConfig = (
  t: any
): Record<EntityType, OwnHeader[]> => {
  const idFormatter = (value) => (isNaN(value) ? null : value);
  const arrayFormatter = (value) => value?.split(',') ?? [];
  return {
    'work-orders': [
      {
        label: t('id'),
        englishLabel: 'ID',
        keyName: 'id',
        formatter: idFormatter
      },
      { label: t('title'), englishLabel: 'Title', keyName: 'title', required: true },
      { label: t('description'), englishLabel: 'Description', keyName: 'description' },
      { label: t('due_date'), englishLabel: 'Due Date', keyName: 'dueDate' },
      { label: t('completed_on'), englishLabel: 'Completed On', keyName: 'completedOn' },
      { label: t('status'), englishLabel: 'Status', keyName: 'status' },
      { label: t('estimated_hours'), englishLabel: 'Estimated Duration', keyName: 'estimatedDuration' },
      { label: t('priority'), englishLabel: 'Priority', keyName: 'priority' },
      { label: t('category'), englishLabel: 'Category', keyName: 'category' },
      { label: t('completed_by'), englishLabel: 'Completed By', keyName: 'completedByEmail' },
      {
        label: t('assigned_to'),
        englishLabel: 'Assigned To',
        keyName: 'assignedToEmails',
        formatter: arrayFormatter
      },
      { label: t('primary_worker'), englishLabel: 'Primary User', keyName: 'primaryUserEmail' },
      { label: t('asset_name'), englishLabel: 'Asset Name', keyName: 'assetName' },
      { label: t('location_name'), englishLabel: 'Location Name', keyName: 'locationName' },
      { label: t('team_name'), englishLabel: 'Team Name', keyName: 'teamName' },
      { label: t('customers'), englishLabel: 'Customers', keyName: 'customersNames', formatter: arrayFormatter },
      { label: t('feedback'), englishLabel: 'Feedback', keyName: 'feedback' },
      { label: t('requires_signature'), englishLabel: 'Requires Signature', keyName: 'requiredSignature' },
      { label: t('archived'), englishLabel: 'Archived', keyName: 'archived' }
    ],
    locations: [
      {
        label: t('id'),
        englishLabel: 'ID',
        keyName: 'id',
        formatter: idFormatter
      },
      { label: t('name'), englishLabel: 'Name', keyName: 'name', required: true },
      { label: t('address'), englishLabel: 'Address', keyName: 'address' },
      { label: t('longitude'), englishLabel: 'Longitude', keyName: 'longitude' },
      { label: t('latitude'), englishLabel: 'Latitude', keyName: 'latitude' },
      { label: t('parent_location'), englishLabel: 'Parent Location', keyName: 'parentLocationName' },
      { label: t('customers'), englishLabel: 'Customers', keyName: 'customersNames', formatter: arrayFormatter },
      { label: t('vendors'), englishLabel: 'Vendors', keyName: 'vendorsNames', formatter: arrayFormatter },
      {
        label: t('assigned_to'),
        englishLabel: 'Assigned To',
        keyName: 'workersEmails',
        formatter: arrayFormatter
      },
      {
        label: t('teams'),
        englishLabel: 'Teams',
        keyName: 'teamsNames',
        formatter: arrayFormatter
      }
    ],
    assets: [
      {
        label: t('id'),
        englishLabel: 'ID',
        keyName: 'id',
        formatter: idFormatter
      },
      { label: t('name'), englishLabel: 'Name', keyName: 'name', required: true },
      { label: t('archived'), englishLabel: 'Archived', keyName: 'archived' },
      { label: t('description'), englishLabel: 'Description', keyName: 'description' },
      { label: t('location_name'), englishLabel: 'Location Name', keyName: 'locationName' },
      { label: t('parent_asset'), englishLabel: 'Parent Asset', keyName: 'parentAssetName' },
      { label: t('area'), englishLabel: 'Area', keyName: 'area' },
      { label: t('barcode'), englishLabel: 'Barcode', keyName: 'barCode' },
      { label: t('model'), englishLabel: 'Model', keyName: 'model' },
      { label: t('power'), englishLabel: 'Power', keyName: 'power' },
      { label: t('manufacturer'), englishLabel: 'Manufacturer', keyName: 'manufacturer' },
      { label: t('category'), englishLabel: 'Category', keyName: 'category' },
      { label: t('primary_worker'), englishLabel: 'Primary User', keyName: 'primaryUserEmail' },
      { label: t('customers'), englishLabel: 'Contractors', keyName: 'customersNames', formatter: arrayFormatter },
      { label: t('vendors'), englishLabel: 'Vendors', keyName: 'vendorsNames', formatter: arrayFormatter },
      {
        label: t('warranty_expiration_date'),
        englishLabel: 'Warranty Expiration Date',
        keyName: 'warrantyExpirationDate'
      },
      { label: t('additional_information'), englishLabel: 'Additional information', keyName: 'additionalInfos' },
      { label: t('serial_number'), englishLabel: 'Serial Number', keyName: 'serialNumber' },
      {
        label: t('assigned_to'),
        englishLabel: 'Assigned To',
        keyName: 'assignedToEmails',
        formatter: arrayFormatter
      },
      {
        label: t('teams'),
        englishLabel: 'Teams',
        keyName: 'teamsNames',
        formatter: arrayFormatter
      },
      {
        label: t('parts'),
        englishLabel: 'Parts',
        keyName: 'partsNames',
        formatter: arrayFormatter
      },
      { label: t('status'), englishLabel: 'Status', keyName: 'status' },
      { label: t('acquisition_cost'), englishLabel: 'Acquisition cost', keyName: 'acquisitionCost' }
    ],
    parts: [
      {
        label: t('id'),
        englishLabel: 'ID',
        keyName: 'id',
        formatter: idFormatter
      },
      { label: t('name'), englishLabel: 'Name', keyName: 'name', required: true },
      { label: t('cost'), englishLabel: 'Cost', keyName: 'cost' },
      { label: t('category'), englishLabel: 'Category', keyName: 'category' },
      { label: t('non_stock'), englishLabel: 'Non Stock', keyName: 'nonStock' },
      { label: t('barcode'), englishLabel: 'Barcode', keyName: 'barcode' },
      { label: t('description'), englishLabel: 'Description', keyName: 'description' },
      { label: t('quantity'), englishLabel: 'Quantity', keyName: 'quantity', required: true },
      { label: t('additional_information'), englishLabel: 'Additional information', keyName: 'additionalInfos' },
      { label: t('area'), englishLabel: 'Area', keyName: 'area' },
      { label: t('minimum_quantity'), englishLabel: 'Minimum Quantity', keyName: 'minQuantity' },
      { label: t('location_name'), englishLabel: 'Location Name', keyName: 'locationName' },
      { label: t('customers'), englishLabel: 'Customers', keyName: 'customersNames', formatter: arrayFormatter },
      { label: t('vendors'), englishLabel: 'Vendors', keyName: 'vendorsNames', formatter: arrayFormatter },
      {
        label: t('assigned_to'),
        englishLabel: 'Assigned To',
        keyName: 'assignedToEmails',
        formatter: arrayFormatter
      },
      {
        label: t('teams'),
        englishLabel: 'Teams',
        keyName: 'teamsNames',
        formatter: arrayFormatter
      }
    ],
    meters: [
      {
        label: t('id'),
        englishLabel: 'ID',
        keyName: 'id',
        formatter: idFormatter
      },
      { label: t('name'), englishLabel: 'Name', keyName: 'name', required: true },
      { label: t('unit'), englishLabel: 'Unit', keyName: 'unit', required: true },
      {
        label: t('update_frequency'),
        englishLabel: 'Update Frequency',
        keyName: 'updateFrequency',
        required: true
      },
      //TODO Asset
      { label: t('asset_name'), englishLabel: 'Asset Name', keyName: 'assetName' },
      { label: t('category'), englishLabel: 'Category', keyName: 'meterCategory' },
      { label: t('location_name'), englishLabel: 'Location Name', keyName: 'locationName' },
      {
        label: t('users'),
        englishLabel: 'Users',
        keyName: 'usersEmails',
        formatter: arrayFormatter
      }
    ]
  };
};

import React, { useMemo, useState } from 'react';
import {
    Box,
    Collapse,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Popover,
    TextField,
    InputAdornment,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import { AssetMiniDTO } from '../../../../models/owns/asset';
import { useTranslation } from 'react-i18next';

interface AssetTreeNode extends AssetMiniDTO {
    children: AssetTreeNode[];
}

interface SelectAssetTreeProps {
    assets: AssetMiniDTO[];
    value: { label: string; value: number } | null;
    onSelect: (asset: { label: string; value: number } | null) => void;
    label: string;
    placeholder?: string;
    required?: boolean;
    error?: boolean;
    helperText?: string;
    disabled?: boolean;
    fullWidth?: boolean;
    onOpen?: () => void;
    onOpenModal?: () => void;
}

const AssetHierarchyItem: React.FC<{
    asset: AssetTreeNode;
    level: number;
    onSelect: (asset: AssetMiniDTO) => void;
    selectedId?: number;
}> = ({
    asset,
    level,
    onSelect,
    selectedId
}) => {
        const [expanded, setExpanded] = useState(true);
        const hasChildren = asset.children.length > 0;

        return (
            <>
                <ListItemButton
                    selected={selectedId === asset.id}
                    onClick={() => onSelect(asset)}
                    sx={{
                        pl: level * 3 + 2,
                        py: 0.5,
                        '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                            }
                        }
                    }}
                >
                    <Box display="flex" alignItems="center" width="100%">
                        {hasChildren ? (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpanded(!expanded);
                                }}
                                sx={{ mr: 0.5, p: 0 }}
                            >
                                {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                            </IconButton>
                        ) : (
                            <Box sx={{ width: 24, mr: 0.5 }} />
                        )}
                        <ListItemText
                            primary={asset.name}
                            primaryTypographyProps={{ variant: 'body2' }}
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
                                    onSelect={onSelect}
                                    selectedId={selectedId}
                                />
                            ))}
                        </List>
                    </Collapse>
                )}
            </>
        );
    };

const SelectAssetTree: React.FC<SelectAssetTreeProps> = ({
    assets,
    value,
    onSelect,
    label,
    placeholder,
    required,
    error,
    helperText,
    disabled,
    fullWidth = true,
    onOpen,
    onOpenModal
}) => {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        if (!disabled) {
            onOpen?.();
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const assetTree = useMemo(() => {
        const sortedAssets = [...assets].sort((a, b) => a.name.localeCompare(b.name));
        const assetMap = new Map<number, AssetTreeNode>();
        sortedAssets.forEach((asset) => assetMap.set(asset.id, { ...asset, children: [] }));

        const roots: AssetTreeNode[] = [];
        sortedAssets.forEach((asset) => {
            const parentId = asset.parentId;
            if (parentId && assetMap.has(parentId)) {
                assetMap.get(parentId)!.children.push(assetMap.get(asset.id)!);
            } else {
                roots.push(assetMap.get(asset.id)!);
            }
        });

        return roots;
    }, [assets]);

    const open = Boolean(anchorEl);

    return (
        <Box width={fullWidth ? '100%' : 'auto'}>
            <TextField
                fullWidth={fullWidth}
                label={label}
                placeholder={placeholder}
                value={value?.label || ''}
                required={required}
                error={error}
                helperText={helperText}
                disabled={disabled}
                onClick={handleClick}
                InputProps={{
                    readOnly: true,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenModal?.();
                                }}
                            >
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                    sx: { cursor: disabled ? 'default' : 'pointer' }
                }}
            />
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
                PaperProps={{
                    sx: { width: anchorEl ? anchorEl.clientWidth : 'auto', maxHeight: 400, mt: 0.5 }
                }}
            >
                <List sx={{ width: '100%', bgcolor: 'background.paper' }} component="nav" disablePadding>
                    {assetTree.length > 0 ? (
                        assetTree.map((asset) => (
                            <AssetHierarchyItem
                                key={asset.id}
                                asset={asset}
                                level={0}
                                selectedId={value?.value}
                                onSelect={(selectedAsset) => {
                                    onSelect({ label: selectedAsset.name, value: selectedAsset.id });
                                    handleClose();
                                }}
                            />
                        ))
                    ) : (
                        <Box p={2}>
                            <Typography variant="body2" color="textSecondary">
                                {t('no_assets')}
                            </Typography>
                        </Box>
                    )}
                </List>
            </Popover>
        </Box>
    );
};

export default SelectAssetTree;

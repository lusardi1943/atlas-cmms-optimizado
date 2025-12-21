import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@mui/lab/DateTimePicker';
import { useDispatch } from '../../../../store';
import { disableUser } from '../../../../slices/user';

interface DeactivateUserDialogProps {
    open: boolean;
    onClose: () => void;
    user: { id: number; firstName: string; lastName: string };
    onSuccess: () => void;
}

export default function DeactivateUserDialog({
    open,
    onClose,
    user,
    onSuccess
}: DeactivateUserDialogProps) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [deactivationType, setDeactivationType] = useState<'indefinite' | 'until_date'>('indefinite');
    const [date, setDate] = useState<Date | null>(null);

    const handleConfirm = () => {
        if (user) {
            setLoading(true);
            const deactivatedUntil = deactivationType === 'until_date' && date ? date.toISOString() : undefined;
            dispatch(disableUser(user.id, deactivatedUntil))
                .then(() => {
                    onSuccess();
                    onClose();
                })
                .finally(() => setLoading(false));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {t('disable')}
                </Typography>
                <Typography variant="subtitle2">
                    {t('confirm_disable_user', { user: user ? `${user.firstName} ${user.lastName}` : '' })}
                </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
                <FormControl component="fieldset">
                    <RadioGroup
                        value={deactivationType}
                        onChange={(e) => setDeactivationType(e.target.value as any)}
                    >
                        <FormControlLabel
                            value="indefinite"
                            control={<Radio />}
                            label={t('indefinite')}
                        />
                        <FormControlLabel
                            value="until_date"
                            control={<Radio />}
                            label={t('until_date')}
                        />
                    </RadioGroup>
                </FormControl>

                {deactivationType === 'until_date' && (
                    <Box pt={2}>
                        <DateTimePicker
                            label={t('select_date')}
                            value={date}
                            onChange={(newValue) => setDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Box>
                )}

                <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button onClick={onClose} sx={{ mr: 1 }}>
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirm}
                        disabled={loading || (deactivationType === 'until_date' && !date)}
                        startIcon={loading ? <CircularProgress size="1rem" /> : null}
                    >
                        {t('disable')}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

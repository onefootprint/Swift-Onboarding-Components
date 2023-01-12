import { Dialog, Typography } from '@onefootprint/ui';
import React from 'react';

type InfoDialogProps = {
  dialogTitle: string;
  children: string;
  open: boolean;
  onClose: () => void;
};

const InfoDialog = ({
  dialogTitle,
  children,
  open,
  onClose,
}: InfoDialogProps) => (
  <Dialog size="default" title={dialogTitle} onClose={onClose} open={open}>
    <Typography
      variant="body-2"
      sx={{ whiteSpace: 'pre-line', marginBottom: 2 }}
    >
      {children}
    </Typography>
  </Dialog>
);

export default InfoDialog;

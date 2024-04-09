import type { UpdateOrgRequest } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import React, { useId, useState } from 'react';

import DialogWrapper from '../dialog-wrapper';

type OverlayFieldSetProps = {
  children: (options: {
    handleSubmit: (payload: UpdateOrgRequest) => void;
    id: string;
  }) => React.ReactNode;
  label: string;
  dialogCancel?: string;
  dialogDelete?: string;
  dialogHeader: string;
  dialogSave?: string;
  value?: string | null;
};

const OverlayFieldSet = ({
  children,
  dialogCancel,
  dialogDelete,
  dialogHeader,
  dialogSave,
  label,
  value,
}: OverlayFieldSetProps) => {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  // const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  return (
    <Stack direction="column" justify="center">
      <Stack align="center" height="32px">
        <Text variant="label-3" color="tertiary">
          {label}
        </Text>
        {/* <IconButton aria-label={dialogHeader} onClick={openDialog}><IcoPencil16 /></IconButton> */}
      </Stack>
      {value ? <Text variant="body-3">{value}</Text> : '-'}
      {/* <LinkButton onClick={openDialog}>{label}</LinkButton> */}
      <DialogWrapper
        id={id}
        labelLink={dialogDelete}
        labelPrimary={dialogSave}
        labelSecondary={dialogCancel}
        loading={false}
        onClose={closeDialog}
        onDeleteData={undefined}
        open={isOpen}
        title={dialogHeader}
      >
        {children({ id, handleSubmit: () => undefined })}
      </DialogWrapper>
    </Stack>
  );
};

export default OverlayFieldSet;

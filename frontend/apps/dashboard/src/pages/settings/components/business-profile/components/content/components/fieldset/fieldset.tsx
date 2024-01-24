import type { UpdateOrgRequest } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useUpdateOrg from 'src/hooks/use-update-org';

import FormDialog from '../form-dialog';
import Label from './components/label';
import Value from './components/value';

export type FieldsetProps = {
  children: (options: {
    id: string;
    handleSubmit: (payload: UpdateOrgRequest) => void;
  }) => React.ReactNode;
  label: string;
  value?: string | null;
};

const Fieldset = ({ children, label, value }: FieldsetProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile',
  });
  const id = useId();
  const [open, setOpen] = useState(false);
  const updateOrgMutation = useUpdateOrg();
  const addText = t('add', { label });
  const editText = t('edit', { label });

  const handleSubmit = (payload: UpdateOrgRequest) => {
    updateOrgMutation.mutate(payload, { onSuccess: closeDialog });
  };

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Stack direction="column" gap={1} justify="center">
      <Label cta={value ? { label: editText, onClick: openDialog } : undefined}>
        {label}
      </Label>
      <Value cta={{ label: addText, onClick: openDialog }}>{value}</Value>
      <FormDialog
        id={id}
        loading={updateOrgMutation.isLoading}
        onClose={closeDialog}
        open={open}
        title={value ? editText : addText}
      >
        {children({ id, handleSubmit })}
      </FormDialog>
    </Stack>
  );
};
export default Fieldset;

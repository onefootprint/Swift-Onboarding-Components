import type { OnboardingConfig } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Form from './components/form';
import useCopyPlaybook from './hooks/use-copy-playbook';
import useTenantsOptions from './hooks/use-tenants-options';

export type CopyHandler = {
  launch: () => void;
};

export type CopyProps = {
  playbook: OnboardingConfig;
};

type FormData = {
  name: string;
  mode: 'sandbox' | 'live';
  tenantId: string;
  tenantName: string;
};

const Copy = forwardRef<CopyHandler, CopyProps>(({ playbook }, ref) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'copy' });
  const copyPlaybookMutation = useCopyPlaybook();
  const tenantsQuery = useTenantsOptions();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  useImperativeHandle(
    ref,
    () => ({
      launch: () => setOpen(true),
    }),
    [],
  );

  const handleSubmit = (formData: FormData) => {
    copyPlaybookMutation.mutate(
      {
        name: formData.name,
        playbookId: playbook.id,
        isLive: formData.mode === 'live',
        tenantId: formData.tenantId,
        tenantName: formData.tenantName,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      primaryButton={{
        label: t('form.cta'),
        type: 'submit',
        form: 'copy-playbook-form',
        loading: copyPlaybookMutation.isPending,
      }}
      secondaryButton={{
        label: t('form.cancel'),
        onClick: handleClose,
        disabled: copyPlaybookMutation.isPending,
      }}
      size="compact"
      title={t('title')}
    >
      {tenantsQuery.data && <Form onSubmit={handleSubmit} playbook={playbook} tenants={tenantsQuery.data} />}
    </Dialog>
  );
});

export default Copy;

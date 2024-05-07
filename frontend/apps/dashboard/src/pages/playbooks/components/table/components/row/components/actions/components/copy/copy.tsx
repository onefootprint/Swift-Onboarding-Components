import type { OnboardingConfig } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useOrgSession from 'src/hooks/use-org-session';

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
};

const Copy = forwardRef<CopyHandler, CopyProps>(({ playbook }, ref) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'copy' });
  const org = useOrgSession();
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
        loading: copyPlaybookMutation.isLoading,
      }}
      secondaryButton={{
        label: t('form.cancel'),
        onClick: handleClose,
        disabled: copyPlaybookMutation.isLoading,
      }}
      size="compact"
      title={t('title')}
    >
      {tenantsQuery.data && (
        <Form
          isOrgSandboxRestricted={org.data?.isSandboxRestricted}
          onSubmit={handleSubmit}
          playbook={playbook}
        />
      )}
    </Dialog>
  );
});

export default Copy;

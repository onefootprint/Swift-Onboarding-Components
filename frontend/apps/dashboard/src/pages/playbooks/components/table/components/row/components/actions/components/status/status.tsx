import { useRequestErrorToast } from '@onefootprint/hooks';
import type { OnboardingConfig } from '@onefootprint/types';
import { OnboardingConfigStatus } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ConfirmationDialog from 'src/components/confirmation-dialog';
import styled from 'styled-components';

import useUpdatePlaybook from '@/playbooks/hooks/use-update-playbook';

export type StatusHandler = {
  toggle: () => void;
};

export type StatusProps = {
  playbook: OnboardingConfig;
};

const Status = forwardRef<StatusHandler, StatusProps>(({ playbook }, ref) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.table.actions.status',
  });
  const [open, setOpen] = useState(false);
  const mutation = useUpdatePlaybook();
  const showErrorToast = useRequestErrorToast();

  const hideConfirmation = () => {
    setOpen(false);
  };

  const disable = () => {
    const status = playbook.status === 'enabled' ? OnboardingConfigStatus.disabled : OnboardingConfigStatus.enabled;

    mutation.mutate(
      {
        id: playbook.id,
        status,
      },
      {
        onSuccess: hideConfirmation,
        onError: (error: unknown) => {
          showErrorToast(error);
        },
      },
    );
  };

  const handleToggle = () => {
    if (playbook.status === 'enabled') {
      setOpen(true);
    } else {
      disable();
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      toggle: handleToggle,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ConfirmationDialog
      isLoading={mutation.isLoading}
      onClose={hideConfirmation}
      onConfirm={disable}
      open={open}
      title={playbook.status === 'enabled' ? t('disable.confirmation.title') : t('enable.confirmation.title')}
    >
      <Trans
        i18nKey={
          playbook.status === 'enabled'
            ? 'pages.playbooks.table.actions.status.disable.confirmation.description'
            : 'pages.playbooks.table.actions.status.enable.confirmation.description'
        }
        components={{
          b: <Bold />,
        }}
        values={{ name: playbook.name }}
      />
    </ConfirmationDialog>
  );
});

const Bold = styled.b`
  ${createFontStyles('label-2')};
`;

export default Status;

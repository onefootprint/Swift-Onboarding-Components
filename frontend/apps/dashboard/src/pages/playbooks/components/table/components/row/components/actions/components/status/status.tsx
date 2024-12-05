import { useRequestErrorToast } from '@onefootprint/hooks';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { OnboardingConfigStatus } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ConfirmationDialog from 'src/components/confirmation-dialog';
import useUpdatePlaybook from 'src/components/playbooks/create-playbook/hooks/use-update-playbook';
import styled from 'styled-components';

export type StatusHandler = {
  toggle: () => void;
};

export type StatusProps = {
  playbook: OnboardingConfiguration;
};

const Status = forwardRef<StatusHandler, StatusProps>(({ playbook: obc }, ref) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'table.actions.status',
  });
  const [open, setOpen] = useState(false);
  const mutation = useUpdatePlaybook();
  const showErrorToast = useRequestErrorToast();

  const hideConfirmation = () => {
    setOpen(false);
  };

  const disable = () => {
    mutation.mutate(
      {
        body: {
          status: obc.status === 'enabled' ? OnboardingConfigStatus.disabled : OnboardingConfigStatus.enabled,
        },
        path: {
          id: obc.playbookId,
        },
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
    if (obc.status === 'enabled') {
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
      isPending={mutation.isPending}
      onClose={hideConfirmation}
      onConfirm={disable}
      open={open}
      title={obc.status === 'enabled' ? t('disable.confirmation.title') : t('enable.confirmation.title')}
    >
      <Trans
        ns="playbooks"
        i18nKey={
          obc.status === 'enabled'
            ? 'table.actions.status.disable.confirmation.description'
            : 'table.actions.status.enable.confirmation.description'
        }
        components={{
          b: <Bold />,
        }}
        values={{ name: obc.name }}
      />
    </ConfirmationDialog>
  );
});

const Bold = styled.b`
  ${createFontStyles('label-2')};
`;

export default Status;

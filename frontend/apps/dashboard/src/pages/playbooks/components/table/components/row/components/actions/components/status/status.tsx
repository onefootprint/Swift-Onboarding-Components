import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { OnboardingConfig, OnboardingConfigStatus } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Trans } from 'react-i18next';
import ConfirmationDialog from 'src/components/confirmation-dialog';
import useUpdatePlaybook from 'src/pages/playbooks/utils/use-update-playbook';

export type StatusHandler = {
  toggle: () => void;
};

export type StatusProps = {
  playbook: OnboardingConfig;
};

const Status = forwardRef<StatusHandler, StatusProps>(({ playbook }, ref) => {
  const { t } = useTranslation('pages.playbooks.table.actions.status');
  const [open, setOpen] = useState(false);
  const mutation = useUpdatePlaybook();
  const showErrorToast = useRequestErrorToast();

  const hideConfirmation = () => {
    setOpen(false);
  };

  const disable = () => {
    mutation.mutate(
      {
        id: playbook.id,
        status:
          playbook.status === 'enabled'
            ? OnboardingConfigStatus.disabled
            : OnboardingConfigStatus.enabled,
      },
      {
        onSuccess: hideConfirmation,
        onError: showErrorToast,
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
      title={
        playbook.status === 'enabled'
          ? t('disable.confirmation.title')
          : t('enable.confirmation.title')
      }
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

import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Trans } from 'react-i18next';
import ConfirmationDialog from 'src/components/confirmation-dialog';
import useUpdateOnboardingConfigs from 'src/pages/developers/components/onboarding-configs/hooks/use-update-onboarding-configs';
import styled from 'styled-components';

export type StatusHandler = {
  toggle: () => void;
};

export type StatusProps = {
  onboardingConfig: OnboardingConfig;
};

const Status = forwardRef<StatusHandler, StatusProps>(
  ({ onboardingConfig }, ref) => {
    const { t } = useTranslation(
      'pages.developers.onboarding-configs-new.actions.status',
    );
    const [open, setOpen] = useState(false);
    const mutation = useUpdateOnboardingConfigs();
    const showErrorToast = useRequestErrorToast();

    const hideConfirmation = () => {
      setOpen(false);
    };

    const disable = () => {
      const newStatus =
        onboardingConfig.status === 'enabled' ? 'disabled' : 'enabled';
      mutation.mutate(
        {
          id: onboardingConfig.id,
          status: newStatus,
        },
        {
          onSuccess: hideConfirmation,
          onError: showErrorToast,
        },
      );
    };

    const handleToggle = () => {
      if (onboardingConfig.status === 'enabled') {
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
          onboardingConfig.status === 'enabled'
            ? t('disable.confirmation.title')
            : t('enable.confirmation.title')
        }
      >
        <Trans
          i18nKey={
            onboardingConfig.status === 'enabled'
              ? 'pages.developers.onboarding-configs-new.actions.status.disable.confirmation.description'
              : 'pages.developers.onboarding-configs-new.actions.status.enable.confirmation.description'
          }
          components={{
            b: <Bold />,
          }}
          values={{ name: onboardingConfig.name }}
        />
      </ConfirmationDialog>
    );
  },
);

const Bold = styled.b`
  ${createFontStyles('label-2')};
`;

export default Status;

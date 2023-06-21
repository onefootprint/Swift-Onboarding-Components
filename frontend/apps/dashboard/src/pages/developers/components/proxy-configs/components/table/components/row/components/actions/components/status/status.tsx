import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { ProxyConfig } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Trans } from 'react-i18next';
import ConfirmationDialog from 'src/components/confirmation-dialog';

import useUpdateProxyConfigs from '@/proxy-configs/hooks/use-update-proxy-configs';

export type StatusHandler = {
  toggle: () => void;
};

export type StatusProps = {
  proxyConfig: ProxyConfig;
};

const Status = forwardRef<StatusHandler, StatusProps>(
  ({ proxyConfig }, ref) => {
    const { t } = useTranslation('pages.proxy-configs.actions.status');
    const [open, setOpen] = useState(false);
    const mutation = useUpdateProxyConfigs();

    const showConfirmation = () => {
      setOpen(true);
    };

    const hideConfirmation = () => {
      setOpen(false);
    };

    const disable = () => {
      mutation.mutate(
        {
          id: proxyConfig.id,
          status: proxyConfig.status === 'enabled' ? 'disabled' : 'enabled',
        },
        {
          onSuccess: hideConfirmation,
        },
      );
    };

    const handleToggle = () => {
      showConfirmation();
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
          proxyConfig.status === 'enabled'
            ? t('disable.confirmation.title')
            : t('enable.confirmation.title')
        }
      >
        <Trans
          i18nKey={
            proxyConfig.status === 'enabled'
              ? 'pages.proxy-configs.actions.status.disable.confirmation.description'
              : 'pages.proxy-configs.actions.status.enable.confirmation.description'
          }
          components={{
            b: <Bold />,
          }}
          values={{ name: proxyConfig.name }}
        />
      </ConfirmationDialog>
    );
  },
);

const Bold = styled.b`
  ${createFontStyles('label-2')};
`;

export default Status;

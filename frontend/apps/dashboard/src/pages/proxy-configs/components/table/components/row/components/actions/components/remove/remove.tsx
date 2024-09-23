import type { ProxyConfig } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ConfirmationDialog from 'src/components/confirmation-dialog';
import styled from 'styled-components';

import useRemoveProxyConfig from './hooks/use-remove-proxy-config';

export type RemoveHandler = {
  remove: () => void;
};

export type RemoveProps = {
  proxyConfig: ProxyConfig;
};

const Remove = forwardRef<RemoveHandler, RemoveProps>(({ proxyConfig }, ref) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.proxy-configs.actions.remove',
  });
  const [open, setOpen] = useState(false);
  const mutation = useRemoveProxyConfig(proxyConfig);

  const showConfirmation = () => {
    setOpen(true);
  };

  const hideConfirmation = () => {
    setOpen(false);
  };

  const remove = () => {
    mutation.mutate();
  };

  const handleRemove = () => {
    showConfirmation();
  };

  useImperativeHandle(
    ref,
    () => ({
      remove: handleRemove,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ConfirmationDialog
      isLoading={mutation.isPending}
      onClose={hideConfirmation}
      onConfirm={remove}
      open={open}
      title={t('confirmation.title')}
    >
      <Trans
        i18nKey="pages.proxy-configs.actions.remove.confirmation.description"
        components={{
          b: <Bold />,
        }}
        values={{ name: proxyConfig.name }}
      />
    </ConfirmationDialog>
  );
});

const Bold = styled.b`
  ${createFontStyles('label-2')};
`;

export default Remove;

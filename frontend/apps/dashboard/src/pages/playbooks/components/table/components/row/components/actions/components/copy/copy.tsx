import { IcoCode16, IcoUser16 } from '@onefootprint/icons';
import type { OnboardingConfig } from '@onefootprint/types';
import { Dialog, RadioSelect, Stack, TextInput } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type CopyHandler = {
  launch: () => void;
};

export type CopyProps = {
  playbook: OnboardingConfig;
};

const Copy = forwardRef<CopyHandler, CopyProps>(({ playbook }, ref) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'copy' });
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line no-console
  console.log(playbook);

  useImperativeHandle(
    ref,
    () => ({
      launch: () => setOpen(true),
    }),
    [],
  );

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      size="compact"
      title={t('title')}
      open={open}
      onClose={handleClose}
      secondaryButton={{
        label: t('form.cancel'),
        onClick: handleClose,
      }}
      primaryButton={{
        label: t('form.cta'),
        onClick: () => {},
      }}
    >
      <Content>
        <Stack gap={7} direction="column">
          <TextInput
            autoFocus
            label={t('form.name.label')}
            placeholder={t('form.name.placeholder')}
          />
          <RadioSelect
            label={t('form.target.label')}
            size="compact"
            options={[
              {
                title: t('form.target.options.live'),
                value: 'live',
                IconComponent: IcoUser16,
              },
              {
                title: t('form.target.options.sandbox'),
                value: 'sandbox',
                IconComponent: IcoCode16,
              },
            ]}
          />
        </Stack>
      </Content>
    </Dialog>
  );
});

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default Copy;

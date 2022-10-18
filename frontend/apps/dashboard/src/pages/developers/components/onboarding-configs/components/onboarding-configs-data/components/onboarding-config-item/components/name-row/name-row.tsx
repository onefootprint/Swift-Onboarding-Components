import { useTranslation } from '@onefootprint/hooks';
import { IcoPencil16 } from '@onefootprint/icons';
import { OnboardingConfig } from '@onefootprint/types';
import { IconButton, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useUpdateOnboardingConfig from '../../hooks/use-update-onboarding-config';

type NameRowProps = {
  data: OnboardingConfig;
  onEdit: () => void;
};

const NameRow = ({ data, onEdit }: NameRowProps) => {
  const { status, name, id, createdAt } = data;
  const { t } = useTranslation('pages.developers.onboarding-configs.list-item');
  const updateMutation = useUpdateOnboardingConfig();
  const toggleStatus = () => {
    const nextStatus = status === 'enabled' ? 'disabled' : 'enabled';
    updateMutation.mutate({ id, status: nextStatus });
  };

  return (
    <tr>
      <th>
        <Name>
          <Typography variant="label-2">{name}</Typography>
          <IconButton
            aria-label={t('edit')}
            iconComponent={IcoPencil16}
            onClick={onEdit}
          />
        </Name>
        <Typography variant="body-4" color="secondary">
          {t('created-at', { date: createdAt })}
        </Typography>
      </th>
      <th>&nbsp;</th>
      <th>
        <LinkButton
          onClick={toggleStatus}
          size="tiny"
          variant={status === 'enabled' ? 'destructive' : 'default'}
        >
          {status === 'enabled'
            ? t('toggle-status.disable')
            : t('toggle-status.enable')}
        </LinkButton>
      </th>
    </tr>
  );
};

const Name = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]}px;
  `}
`;

export default NameRow;

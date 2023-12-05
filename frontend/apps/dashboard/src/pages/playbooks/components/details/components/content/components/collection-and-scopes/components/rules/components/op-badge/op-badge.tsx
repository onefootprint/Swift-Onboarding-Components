import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';

export type OpBadgeProps = {
  isActive: boolean;
};

const OpBadge = ({ isActive }: OpBadgeProps) => {
  const { t } = useTranslation('pages.playbooks.details.rules.action-row');
  return <Badge data-is-active={isActive}>{t('not')}</Badge>;
};

const Badge = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    background-color: ${theme.backgroundColor.neutral};
    border-radius: ${theme.borderRadius.large};
    border: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    color: ${theme.color.quaternary};
    margin-right: ${theme.spacing[2]};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    display: inline-flex;
    justify-content: center;
    align-items: center;

    &[data-is-active='true'] {
      background-color: ${theme.backgroundColor.error};
      border: 0;
      color: ${theme.color.error};
    }
  `}
`;

export default OpBadge;

import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Dropdown, createOverlayBackground } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import LanguagesSubmenu from './components/languages-submenu';
import SupportSubmenu from './components/support-submenu';

type FooterActionsProps = {
  onWhatsThisClick?: () => void;
  config?: PublicOnboardingConfig;
};

const handleRedirect = (url: string) => {
  window.open(url, '_blank');
};

const FooterActions = ({ onWhatsThisClick, config }: FooterActionsProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.layout',
  });

  return (
    <Dropdown.Root>
      <DropdownTrigger>
        <IcoDotsHorizontal24 />
      </DropdownTrigger>
      <DropdownContent align="end">
        <Dropdown.Item onClick={onWhatsThisClick} size="tiny">
          {t('whats-this')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleRedirect(`${FRONTPAGE_BASE_URL}/privacy-policy`)} size="tiny">
          {t('privacy')}
        </Dropdown.Item>
        <LanguagesSubmenu />
        <SupportSubmenu config={config} />
      </DropdownContent>
    </Dropdown.Root>
  );
};

const DropdownTrigger = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};

    &[data-state='open'] {
      ${createOverlayBackground('darken-1', 'senary')};
    }
  `}
`;

const DropdownContent = styled(Dropdown.Content)`
  ${({ theme }) => css`
    min-width: fit-content;
    padding: ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default FooterActions;

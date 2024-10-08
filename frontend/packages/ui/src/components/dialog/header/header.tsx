import { IcoClose24 } from '@onefootprint/icons';
import type { Icon } from '@onefootprint/icons';
import * as RadixDialog from '@radix-ui/react-dialog';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import IconButton from '../../icon-button';
import Text from '../../text';

import { HEADER_HEIGHT } from '../dialog.constants';

interface HeaderProps {
  title: string;
  onClose: () => void;
  icon?: {
    component: Icon;
    ariaLabel?: string;
    onClick?: () => void;
  };
}

const DialogHeader = forwardRef<HTMLDivElement, HeaderProps>(({ title, onClose, icon }, ref) => {
  const { t } = useTranslation('ui');
  const IconComponent: Icon = icon?.component ?? IcoClose24;
  const iconAriaLabel = icon?.ariaLabel ?? t('components.dialog.header-icon.aria-label-default');
  const iconOnClick = icon?.onClick ?? onClose;

  return (
    <StyledHeader ref={ref}>
      <RadixDialog.Close asChild>
        <IconButton aria-label={iconAriaLabel} onClick={iconOnClick}>
          <IconComponent />
        </IconButton>
      </RadixDialog.Close>
      <RadixDialog.Title asChild>
        <Text variant="label-3" textAlign="center" truncate>
          {title}
        </Text>
      </RadixDialog.Title>
    </StyledHeader>
  );
});

const StyledHeader = styled.header`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 32px 1fr 32px;
    position: sticky;
    align-items: center;
    top: 0;
    z-index: 1;
    height: ${HEADER_HEIGHT}px;
    padding: 0 ${theme.spacing[3]};
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default DialogHeader;

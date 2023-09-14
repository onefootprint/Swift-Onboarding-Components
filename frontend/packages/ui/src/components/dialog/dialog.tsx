import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import FocusTrap from 'focus-trap-react';
import React, { useRef } from 'react';
import {
  useElementSize,
  useEventListener,
  useLockedBody,
  useOnClickOutside,
} from 'usehooks-ts';

import media from '../../utils/media';
import Box from '../box';
import Button from '../button';
import Fade from '../fade';
import IconButton from '../icon-button';
import LinkButton from '../link-button';
import Overlay from '../overlay';
import Portal from '../portal';
import ScrollArea from '../scroll-area';
import Typography from '../typography';
import type {
  DialogAllButtons,
  DialogHeaderIcon,
  DialogNoButtons,
  DialogOnlyButtons,
  DialogOnlyPrimaryButton,
  DialogPrimaryAndLinkButtons,
  DialogSize,
} from './dialog.types';

export type DialogProps = {
  children?: React.ReactNode;
  headerIcon?: DialogHeaderIcon;
  onClose: () => void;
  open?: boolean;
  size?: DialogSize;
  testID?: string;
  title: string;
  isConfirmation?: boolean;
  disableResponsiveness?: boolean;
} & (
  | DialogOnlyPrimaryButton
  | DialogOnlyButtons
  | DialogPrimaryAndLinkButtons
  | DialogNoButtons
  | DialogAllButtons
);

const Dialog = ({
  children,
  onClose,
  headerIcon: {
    component: HeaderIconComponent = IcoClose24,
    onClick: onHeaderIconClick = onClose,
    ariaLabel: headerIconAriaLabel = 'Close',
  } = {
    component: IcoClose24,
    onClick: onClose,
    ariaLabel: 'Close',
  },
  linkButton = undefined,
  open,
  primaryButton,
  secondaryButton = undefined,
  size = 'default',
  testID,
  title,
  disableResponsiveness = false,
  isConfirmation = false,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useLockedBody(open);
  useOnClickOutside(dialogRef, onClose);
  useEventListener('keydown', event => {
    if (event.key === 'Escape') {
      onClose();
    }
  });

  const [footerRef, { height: footerHeight }] = useElementSize();

  return open ? (
    <Portal selector="#footprint-portal">
      <FocusTrap>
        <DialogContainer
          role="dialog"
          aria-label={title}
          testID={testID}
          isVisible={open}
          from="center"
          to="center"
          size={size}
          disableResponsiveness={disableResponsiveness}
          onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
          }}
          isConfirmation={isConfirmation}
          ref={dialogRef}
        >
          <Header>
            <CloseContainer>
              <IconButton
                aria-label={headerIconAriaLabel}
                onClick={onHeaderIconClick}
              >
                <HeaderIconComponent />
              </IconButton>
            </CloseContainer>
            <Typography variant="label-2">{title}</Typography>
          </Header>
          <ScrollArea
            sx={{
              padding: 7,
              maxHeight: `calc(100% - ${footerHeight}px)`,
            }}
          >
            {children}
          </ScrollArea>
          {linkButton || primaryButton || secondaryButton ? (
            <Footer ref={footerRef}>
              <Box>
                {linkButton && (
                  <LinkButton
                    onClick={linkButton.onClick}
                    size="compact"
                    type={linkButton.type}
                    form={linkButton.form}
                  >
                    {linkButton.label}
                  </LinkButton>
                )}
              </Box>
              <ButtonsContainer>
                {secondaryButton && (
                  <Button
                    disabled={secondaryButton.disabled}
                    form={secondaryButton.form}
                    loading={secondaryButton.loading}
                    loadingAriaLabel={secondaryButton.loadingAriaLabel}
                    onClick={secondaryButton.onClick}
                    size="compact"
                    type={secondaryButton.type}
                    variant="secondary"
                  >
                    {secondaryButton.label}
                  </Button>
                )}
                {primaryButton && (
                  <Button
                    disabled={primaryButton.disabled}
                    form={primaryButton.form}
                    loading={primaryButton.loading}
                    loadingAriaLabel={primaryButton.loadingAriaLabel}
                    onClick={primaryButton.onClick}
                    size="compact"
                    type={primaryButton.type}
                    variant="primary"
                  >
                    {primaryButton.label}
                  </Button>
                )}
              </ButtonsContainer>
            </Footer>
          ) : null}
        </DialogContainer>
      </FocusTrap>
      <StyledOverlay isVisible={open} isConfirmation={isConfirmation} />
    </Portal>
  ) : null;
};

const getSize = (size: DialogSize, isConfirmation: boolean) => {
  if (isConfirmation) {
    switch (size) {
      case 'compact':
        return '468px';
      case 'large':
        return '800px';
      case 'full-screen':
        return '100vw';
      default:
        return '650px';
    }
  } else {
    switch (size) {
      case 'compact':
        return '500px';
      case 'large':
        return '800px';
      case 'full-screen':
        return '100vw';
      default:
        return '650px';
    }
  }
};

const getDistanceFromTop = (isConfirmation: boolean, size: DialogSize) => {
  if (isConfirmation) {
    return '50%';
  }
  if (size === 'full-screen') {
    return '0';
  }
  return false;
};

const DialogContainer = styled(Fade)<{
  size: DialogSize;
  disableResponsiveness: boolean;
  isConfirmation: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}>`
  ${({ theme, disableResponsiveness, size, isConfirmation }) => css`
    background-color: ${theme.surfaceColor[2]};
    display: flex;
    flex-direction: column;
    isolation: isolate;
    justify-content: stretch;
    position: absolute;
    z-index: ${theme.zIndex.dialog};
    width: ${getSize(size, isConfirmation)};
    max-width: ${size !== 'full-screen' ? '90%' : '100%'};
    height: ${size === 'full-screen' ? '100vh' : 'inherit'};
    max-height: ${size !== 'full-screen'
      ? `calc(100vh - 2 * ${theme.spacing[9]})`
      : 'inherit'};
    border-radius: ${size === 'full-screen' ? 0 : theme.borderRadius.default};
    top: ${getDistanceFromTop(isConfirmation, size) || theme.spacing[9]};
    left: 50%;
    transform: ${isConfirmation
      ? 'translate(-50%, -50%)'
      : 'translate(-50%, 0%)'} !important;
    z-index: ${isConfirmation
      ? theme.zIndex.confirmationDialog
      : theme.zIndex.dialog};

    ${!disableResponsiveness &&
    media.lessThan('sm')`
        top: 0;
        max-height: none;
        width: 100vw;
        height: 100vh;
        border-radius: 0;
    `};
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    justify-content: center;
    padding: 0 ${theme.spacing[5]};
    height: 52px;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 1;
  `}
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[5]};
  `}
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
    flex-shrink: 0;
    background-color: ${theme.surfaceColor[2]};
    width: 100%;
    z-index: 1;
    position: sticky;
    bottom: 0;
    border-radius: 0 0 ${theme.borderRadius.default}
      ${theme.borderRadius.default};
  `}
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
  `}
`;

const StyledOverlay = styled(Overlay)<{ isConfirmation: boolean }>`
  ${({ theme, isConfirmation }) => css`
    ${isConfirmation &&
    `
      z-index: ${theme.zIndex.confirmationOverlay};
    `};
  `}
`;

export default Dialog;

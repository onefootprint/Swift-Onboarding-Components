import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import FocusTrap from 'focus-trap-react';
import React, { useRef } from 'react';
import {
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

  return open ? (
    <Portal selector="#footprint-portal">
      <FocusTrap>
        <div>
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
            <ScrollArea sx={{ padding: 7 }}>{children}</ScrollArea>
            {linkButton || primaryButton || secondaryButton ? (
              <Footer>
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
        </div>
      </FocusTrap>
      <StyledOverlay isVisible={open} isConfirmation={isConfirmation} />
    </Portal>
  ) : null;
};

const DialogContainer = styled(Fade)<{
  size: DialogSize;
  disableResponsiveness: boolean;
  isConfirmation: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}>`
  ${({ theme, disableResponsiveness }) => css`
    background-color: ${theme.surfaceColor[2]};
    display: flex;
    flex-direction: column;
    isolation: isolate;
    justify-content: stretch;
    position: fixed;
    z-index: ${theme.zIndex.dialog};

    ${!disableResponsiveness &&
    media.lessThan('sm')`
        top: 0;
        max-height: none;
        width: 100vw;
        height: 100vh;
        border-radius: 0;
    `};
  `}

  ${({ theme, size }) => {
    if (size !== 'full-screen') {
      return css`
        border-radius: ${theme.borderRadius.default};
        box-shadow: ${theme.elevation[3]};
        left: 50%;
        max-height: calc(100vh - ${theme.spacing[9]} * 2);
        top: ${theme.spacing[9]};
        transform: translateX(-50%) !important;
      `;
    }
    return undefined;
  }}

  ${({ theme, isConfirmation }) => {
    if (isConfirmation) {
      return css`
        // !important is needed to override the transform from the Fade component
        transform: translate(-50%, -50%) !important;
        top: 50%;
        z-index: ${theme.zIndex.confirmationDialog};
      `;
    }
    return undefined;
  }}

  ${({ size, isConfirmation }) => {
    if (size === 'compact') {
      if (isConfirmation) {
        return css`
          width: 468px;
        `;
      }
      return css`
        width: 500px;
      `;
    }
    if (size === 'large') {
      return css`
        width: 800px;
      `;
    }
    if (size === 'full-screen') {
      return css`
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
      `;
    }
    return css`
      width: 650px;
    `;
  }}
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

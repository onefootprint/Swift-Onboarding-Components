import { IcoClose24, Icon } from '@onefootprint/icons';
import FocusTrap from 'focus-trap-react';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import {
  useEventListener,
  useLockedBody,
  useOnClickOutside,
} from 'usehooks-ts';

import media from '../../../../utils/media';
import Box from '../../../box';
import Button from '../../../button';
import Fade from '../../../fade/fade';
import IconButton from '../../../icon-button';
import LinkButton from '../../../link-button';
import Overlay from '../../../overlay';
import Portal from '../../../portal';
import Typography from '../../../typography';
import ScrollArea from '../scroll-area';
import {
  AllButtons,
  NoButtons,
  OnlyButtons,
  OnlyPrimaryButton,
  PrimaryAndLinkButtons,
  Size,
} from './types';

type BaseDialogProps = {
  children?: React.ReactNode;
  closeAriaLabel?: string;
  closeIconComponent?: Icon;
  onClose: () => void;
  open?: boolean;
  size?: Size;
  testID?: string;
  title: string;
  isResponsive?: boolean;
  isConfirmation?: boolean;
} & (
  | AllButtons
  | OnlyPrimaryButton
  | OnlyButtons
  | PrimaryAndLinkButtons
  | NoButtons
);

const SMALL_WIDTH = 343;
const MEDIUM_WIDTH = 500;
const LARGE_WIDTH = 650;
const DEFAULT_WIDTH = 800;

const BaseDialog = ({
  children,
  closeAriaLabel = 'Close',
  closeIconComponent: CloseIcon = IcoClose24,
  linkButton = undefined,
  onClose,
  open,
  primaryButton,
  secondaryButton = undefined,
  size = 'default',
  testID,
  title,
  isResponsive = false,
  isConfirmation = false,
}: BaseDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dialogRef, onClose);
  useLockedBody(open);
  useEventListener('keydown', event => {
    if (event.key === 'Escape') {
      onClose();
    }
  });

  return open ? (
    <Portal selector="#footprint-portal">
      <FocusTrap>
        <div>
          <Overlay isVisible={open} />
          <DialogContainer
            role="dialog"
            aria-label={title}
            testID={testID}
            isVisible={open}
            from="center"
            to="center"
            size={size}
            isResponsive={isResponsive}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              event.stopPropagation();
            }}
            isConfirmation={isConfirmation}
            ref={dialogRef}
          >
            <Header>
              <CloseContainer>
                <IconButton aria-label={closeAriaLabel} onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </CloseContainer>
              <Typography variant="label-2">{title}</Typography>
            </Header>
            <ScrollArea>{children}</ScrollArea>
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
      <Overlay />
    </Portal>
  ) : null;
};

const DialogContainer = styled(Fade)<{
  size: Size;
  isResponsive: boolean;
  isConfirmation: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}>`
  ${({ theme, isResponsive, isConfirmation }) => css`
    position: absolute;
    display: flex;
    flex-direction: column;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[3]};
    z-index: ${theme.zIndex.dialog};
    overflow: hidden;
    justify-content: stretch;
    top: ${theme.spacing[9]};
    transform: translateX(-50%);
    left: 50%;
    max-height: calc(100vh - ${theme.spacing[9]} * 2);
    isolation: isolate;
    left: 50%;

    ${isConfirmation &&
    `
      top: 50%;
      left: 50%;
      max-width: 90%;
    `}

    ${isResponsive &&
    media.lessThan('sm')`
        top: 0;
        left: 0;
        max-height: none;
        width: 100vw;
        height: 100vh;
        border-radius: 0;
    `};
  `}

  ${({ size }) => {
    if (size === 'small') {
      return css`
        width: ${SMALL_WIDTH}px;
        left: calc(50% - ${SMALL_WIDTH / 2}px);
      `;
    }
    if (size === 'compact') {
      return css`
        width: ${MEDIUM_WIDTH}px;
        left: calc(50% - ${MEDIUM_WIDTH / 2}px);
      `;
    }
    if (size === 'default') {
      return css`
        width: ${LARGE_WIDTH}px;
        left: calc(50% - ${LARGE_WIDTH / 2}px);
      `;
    }
    return css`
      width: ${DEFAULT_WIDTH}px;
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
    background-color: ${theme.backgroundColor.primary};
    width: 100%;
    z-index: 1;
    position: sticky;
    bottom: 0;
  `}
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
  `}
`;

export default BaseDialog;

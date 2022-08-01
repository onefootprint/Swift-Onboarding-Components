import FocusTrap from 'focus-trap-react';
import type { Icon } from 'icons';
import IcoClose24 from 'icons/ico/ico-close-16';
import React from 'react';
import { useKey, useLockBodyScroll } from 'react-use';
import styled, { css } from 'styled-components';

import Box from '../box';
import Button from '../button';
import IconButton from '../icon-button';
import Overlay from '../internal/overlay';
import LinkButton from '../link-button';
import Portal from '../portal';
import Typography from '../typography';

type DialogButton = {
  disabled?: boolean;
  form?: string;
  label: string;
  loading?: boolean;
  onClick?: (dataSubmitted?: any) => void;
  type?: 'button' | 'submit' | 'reset';
};

type DialogLinkButton = {
  label: string;
  onClick?: () => void;
};

type Size = 'small' | 'compact' | 'default' | 'large';

type OnlyPrimaryButton = {
  primaryButton: DialogButton;
  secondaryButton?: never;
  linkButton?: never;
};

type OnlyButtons = {
  primaryButton: DialogButton;
  secondaryButton: DialogButton;
  linkButton?: never;
};

type PrimaryAndLinkButtons = {
  primaryButton: DialogButton;
  secondaryButton?: never;
  linkButton: DialogLinkButton;
};

export type DialogProps = {
  children?: React.ReactNode;
  closeAriaLabel?: string;
  closeIconComponent?: Icon;
  onClose: () => void;
  open?: boolean;
  size?: Size;
  testID?: string;
  title: string;
} & (OnlyPrimaryButton | OnlyButtons | PrimaryAndLinkButtons);

const Dialog = ({
  children,
  closeAriaLabel = 'Close',
  closeIconComponent = IcoClose24,
  linkButton = undefined,
  onClose,
  open,
  primaryButton,
  secondaryButton = undefined,
  size = 'default',
  testID,
  title,
}: DialogProps) => {
  useLockBodyScroll(open);
  useKey('Escape', onClose);

  return open ? (
    <Portal selector="#footprint-portal">
      <FocusTrap>
        <Overlay onClick={onClose} aria-modal>
          <DialogContainer
            aria-label={title}
            data-testid={testID}
            role="dialog"
            size={size}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              event.stopPropagation();
            }}
          >
            <Header>
              <CloseContainer>
                <IconButton
                  aria-label={closeAriaLabel}
                  iconComponent={closeIconComponent}
                  onClick={onClose}
                />
              </CloseContainer>
              <Typography variant="label-2">{title}</Typography>
            </Header>
            <Body>{children}</Body>
            <Footer>
              <Box>
                {linkButton && (
                  <LinkButton onClick={linkButton.onClick} size="compact">
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
                    onClick={secondaryButton.onClick}
                    type={secondaryButton.type}
                    size="compact"
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
                    onClick={primaryButton.onClick}
                    type={primaryButton.type}
                    size="compact"
                    variant="primary"
                  >
                    {primaryButton.label}
                  </Button>
                )}
              </ButtonsContainer>
            </Footer>
          </DialogContainer>
        </Overlay>
      </FocusTrap>
    </Portal>
  ) : null;
};

const DialogContainer = styled.div<{
  size: Size;
}>`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[2]}px;
    box-shadow: ${theme.elevation[3]};
    z-index: ${theme.zIndex.dialog};
  `}
  ${({ size }) => {
    if (size === 'small') {
      return css`
        width: 343px;
      `;
    }
    if (size === 'compact') {
      return css`
        width: 500px;
      `;
    }
    if (size === 'default') {
      return css`
        width: 650px;
      `;
    }
    return css`
      width: 800px;
    `;
  }}
`;

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    border-bottom: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    justify-content: center;
    padding: 0 ${theme.spacing[5]}px;
    height: 56px;
    position: relative;
  `}
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[5]}px;
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]}px;
  `}
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[5]}px ${theme.spacing[7]}px;
  `}
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]}px;
  `}
`;

export default Dialog;

import { IcoClose24, Icon } from '@onefootprint/icons';
import FocusTrap from 'focus-trap-react';
import React from 'react';
import styled, { css } from 'styled-components';
import { useEventListener, useLockedBody } from 'usehooks-ts';

import { media } from '../../../utils';
import Box from '../../box';
import Button from '../../button';
import IconButton from '../../icon-button';
import LinkButton from '../../link-button';
import Overlay from '../../overlay';
import Portal from '../../portal';
import Typography from '../../typography';
import {
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
} & (OnlyPrimaryButton | OnlyButtons | PrimaryAndLinkButtons | NoButtons);

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
}: BaseDialogProps) => {
  useLockedBody(open);
  useEventListener('keydown', event => {
    if (event.key === 'Escape') {
      onClose();
    }
  });

  return open ? (
    <Portal selector="#footprint-portal">
      <FocusTrap>
        <Overlay onClick={onClose} aria-modal>
          <DialogContainer
            aria-label={title}
            data-testid={testID}
            role="dialog"
            size={size}
            isResponsive={isResponsive}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              event.stopPropagation();
            }}
          >
            <Header>
              <CloseContainer>
                <IconButton aria-label={closeAriaLabel} onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </CloseContainer>
              <Typography variant="label-2">{title}</Typography>
            </Header>
            <Body>{children}</Body>
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
        </Overlay>
      </FocusTrap>
    </Portal>
  ) : null;
};

const DialogContainer = styled.div<{
  size: Size;
  isResponsive: boolean;
}>`
  ${({ theme, isResponsive }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[3]};
    z-index: ${theme.zIndex.dialog};

    ${isResponsive &&
    media.lessThan('sm')`
      width: 100vw;
      height: 100vh;
      border-radius: 0;
    `}
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
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    justify-content: center;
    padding: 0 ${theme.spacing[5]};
    height: 52px;
    position: relative;
  `}
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[5]};
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]};
  `}
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
  `}
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
  `}
`;

export default BaseDialog;

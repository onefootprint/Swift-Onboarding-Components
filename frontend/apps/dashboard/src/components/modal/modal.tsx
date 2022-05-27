import IcoClose24 from 'icons/ico/ico-close-16';
import { rgba } from 'polished';
import React, { useEffect } from 'react';
import styled, { css } from 'styled';
import { Button, IconButton, LinkButton, Typography } from 'ui';

export enum ModalCloseEvent {
  Close = 'close',
  Primary = 'primary',
  Secondary = 'secondary',
}

export type ModalProps = {
  size?: 'compact' | 'default' | 'large';
  headerText: String;
  primaryButtonText: string;
  secondaryButtonText?: string;
  secondaryButtonVariant?: 'link' | 'default';
  children?: JSX.Element;
  onClose: (event: ModalCloseEvent) => void;
};

const Modal = ({
  size = 'default',
  headerText,
  primaryButtonText,
  secondaryButtonText,
  secondaryButtonVariant = 'default',
  children,
  onClose,
}: ModalProps) => {
  useEffect(() => {
    // Close the modal when the escape key is hit
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(ModalCloseEvent.Close);
      } else if (event.key === 'Enter') {
        onClose(ModalCloseEvent.Primary);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  return (
    <Mask
      onClick={e => {
        if (e.target !== e.currentTarget) {
          return;
        }
        onClose(ModalCloseEvent.Close);
      }}
    >
      <Content size={size}>
        <Header>
          <CloseContainer>
            <IconButton
              ariaLabel="Close"
              Icon={IcoClose24}
              onClick={() => onClose(ModalCloseEvent.Close)}
            />
          </CloseContainer>
          <HeaderContainer>
            <Typography
              variant="label-2"
              sx={{ textAlign: 'center', userSelect: 'none' }}
            >
              {headerText}
            </Typography>
          </HeaderContainer>
        </Header>
        <Children>{children}</Children>
        <Footer>
          {secondaryButtonText && secondaryButtonVariant === 'link' && (
            <LinkButton
              size="compact"
              onClick={() => onClose(ModalCloseEvent.Secondary)}
            >
              {secondaryButtonText}
            </LinkButton>
          )}
          <FooterRight>
            {secondaryButtonText && secondaryButtonVariant === 'default' && (
              <Button
                size="compact"
                variant="secondary"
                onClick={() => onClose(ModalCloseEvent.Secondary)}
              >
                {secondaryButtonText}
              </Button>
            )}
            <Button
              size="compact"
              onClick={() => onClose(ModalCloseEvent.Primary)}
            >
              {primaryButtonText}
            </Button>
          </FooterRight>
        </Footer>
      </Content>
    </Mask>
  );
};

export default Modal;

// TODO background color
const Mask = styled.div`
  display: block;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  ${({ theme }) => css`
    z-index: ${theme.zIndex.modal};
    background-color: ${rgba(theme.backgroundColor.tertiary, 0.5)};
  `}
`;

// TODO top margin
const Content = styled.div<{
  size: 'compact' | 'default' | 'large';
}>`
  margin: 10% auto;
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border: 1px solid ${theme.borderColor.primary};
    border-radius: ${theme.borderRadius[1]}px;
  `}
  ${({ size }) => {
    let width;
    if (size === 'compact') {
      width = 500;
    } else if (size === 'default') {
      width = 650;
    } else if (size === 'large') {
      width = 800;
    }
    return css`
      width: ${width}px;
    `;
  }}
`;

const Header = styled.div`
  position: relative;
  align-items: center;
  justify-content: center;
  ${({ theme }) => css`
    height: 60px;
    background-color: ${theme.backgroundColor.primary};
    border-bottom: 1px solid ${theme.borderColor.primary};
  `}
`;

const CloseContainer = styled.div`
  position: absolute;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => css`
    left: ${theme.spacing[4]}px;
  `}
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
`;

const Children = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]}px ${theme.spacing[7]}px;
  `}
`;

const Footer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  ${({ theme }) => css`
    height: 72px;
    padding: ${theme.spacing[5]}px ${theme.spacing[7]}px;
  `}
`;

const FooterRight = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => css`
    padding: ${theme.spacing[5]}px ${theme.spacing[7]}px;
    gap: ${theme.spacing[4]}px;
  `}
`;

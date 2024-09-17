import { IcoClose24 } from '@onefootprint/icons';
import * as RadixDialog from '@radix-ui/react-dialog';
import type React from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import media from '../../utils/media';
import Box from '../box';
import Button from '../button';
import IconButton from '../icon-button';
import LinkButton from '../link-button';
import Overlay from '../overlay';
import ScrollArea from '../scroll-area';
import Text from '../text';
import type {
  DialogAllButtons,
  DialogAllExceptHeaderButtons,
  DialogHeaderIcon,
  DialogNoButtons,
  DialogOnlyButtons,
  DialogOnlyHeaderButton,
  DialogOnlyPrimaryButton,
  DialogPrimaryAndLinkButtons,
  DialogSize,
} from './dialog.types';

export type DialogProps = {
  onClose: () => void;
  open: boolean;
  children?: React.ReactNode;
  headerIcon?: DialogHeaderIcon;
  size?: DialogSize;
  testID?: string;
  title: string;
  isConfirmation?: boolean;
  disableResponsiveness?: boolean;
} & (
  | DialogOnlyPrimaryButton
  | DialogOnlyHeaderButton
  | DialogOnlyButtons
  | DialogPrimaryAndLinkButtons
  | DialogNoButtons
  | DialogAllExceptHeaderButtons
  | DialogAllButtons
);

const Dialog = ({
  children,
  onClose,
  headerIcon: {
    component: HeaderIconComponent = IcoClose24,
    onClick: onHeaderIconClick = onClose,
    ariaLabel: headerIconAriaLabel,
  } = {
    component: IcoClose24,
    onClick: onClose,
  },
  linkButton = undefined,
  open,
  primaryButton,
  secondaryButton = undefined,
  headerButton = undefined,
  size = 'default',
  testID,
  title,
  disableResponsiveness = false,
  isConfirmation = false,
}: DialogProps) => {
  const { t } = useTranslation('ui');
  const dialogRef = useRef<HTMLDivElement>(null);

  return (
    <RadixDialog.Root open={open} onOpenChange={onClose}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay asChild>
          <Overlay isVisible={open} />
        </RadixDialog.Overlay>
        <RadixDialog.Content
          onPointerDownOutside={onClose}
          onEscapeKeyDown={onClose}
          forceMount
          asChild
          aria-describedby={undefined}
        >
          <DialogContainer
            aria-label={title}
            data-testid={testID}
            aria-describedby={undefined}
            size={size}
            $disableResponsiveness={disableResponsiveness}
            $isConfirmation={isConfirmation}
            ref={dialogRef}
          >
            <Header>
              <CloseContainer>
                <RadixDialog.Close asChild>
                  <IconButton
                    aria-label={headerIconAriaLabel ?? t('components.dialog.header-icon.aria-label-default')}
                    onClick={onHeaderIconClick}
                  >
                    <HeaderIconComponent />
                  </IconButton>
                </RadixDialog.Close>
              </CloseContainer>
              <RadixDialog.Title asChild>
                <Text variant="label-2">{title}</Text>
              </RadixDialog.Title>
              <HeaderButtonContainer>
                {headerButton && (
                  <Button
                    disabled={headerButton.disabled}
                    form={headerButton.form}
                    loading={headerButton.loading}
                    loadingAriaLabel={headerButton.loadingAriaLabel}
                    onClick={headerButton.onClick}
                    type={headerButton.type}
                    variant="primary"
                  >
                    {headerButton.label}
                  </Button>
                )}
              </HeaderButtonContainer>
            </Header>
            <ContentWrapper>
              <ScrollArea paddingTop={7} paddingBottom={5} paddingLeft={7} paddingRight={7} maxHeight="100%">
                {children}
              </ScrollArea>
            </ContentWrapper>
            {linkButton || primaryButton || secondaryButton ? (
              <Footer>
                <Box>
                  {linkButton && (
                    <LinkButton onClick={linkButton.onClick} type={linkButton.type} form={linkButton.form}>
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
                      type={primaryButton.type}
                      variant="primary"
                      autoFocus={isConfirmation}
                    >
                      {primaryButton.label}
                    </Button>
                  )}
                </ButtonsContainer>
              </Footer>
            ) : null}
          </DialogContainer>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
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
  }
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

const DialogContainer = styled(Box)<{
  size: DialogSize;
  $disableResponsiveness: boolean;
  $isConfirmation: boolean;
}>`
  ${({ theme, $disableResponsiveness, size, $isConfirmation }) => css`
    background-color: ${theme.backgroundColor.primary};
    display: flex;
    flex-direction: column;
    isolation: isolate;
    justify-content: stretch;
    position: fixed;
    z-index: ${$isConfirmation ? theme.zIndex.confirmationDialog : theme.zIndex.dialog};
    width: ${getSize(size, $isConfirmation)};
    max-width: ${size !== 'full-screen' ? '90%' : '100%'};
    height: ${size === 'full-screen' ? '100vh' : 'inherit'};
    max-height: ${size !== 'full-screen' ? `calc(100vh - 2 * ${theme.spacing[9]})` : 'inherit'};
    border-radius: ${size === 'full-screen' ? 0 : theme.borderRadius.default};
    top: ${getDistanceFromTop($isConfirmation, size) || theme.spacing[9]};
    box-shadow: ${theme.elevation[2]};
    left: 50%;
    transform: ${$isConfirmation ? 'translate(-50%, -50%)' : 'translate(-50%, 0%)'};
    z-index: ${$isConfirmation ? theme.zIndex.confirmationDialog : theme.zIndex.dialog};

    ${
      !$disableResponsiveness &&
      media.lessThan('sm')`
        top: 0;
        left: 0;
        right: 0;
        max-height: 100dvh;
        width: 100%;
        max-width: 100%;
        height: 100vh;
        border-radius: 0;
        transform: none;
    `
    };
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    justify-content: center;
    padding: 0 ${theme.spacing[5]};
    height: 48px;
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

const HeaderButtonContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    right: ${theme.spacing[5]};
  `}
`;

const ContentWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[4]} ${theme.spacing[7]} ${theme.spacing[5]}
      ${theme.spacing[7]};
    flex-shrink: 0;
    background-color: ${theme.backgroundColor.primary};
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

export default Dialog;

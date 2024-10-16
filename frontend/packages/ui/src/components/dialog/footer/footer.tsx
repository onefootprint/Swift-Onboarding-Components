import styled, { css } from 'styled-components';
import media from '../../../utils/media';
import Button from '../../button';
import LinkButton from '../../link-button';
import Stack from '../../stack';
import type { DialogFooter, DialogSize } from '../dialog.types';

const Footer = ({ linkButton, primaryButton, secondaryButton, size }: DialogFooter) => {
  const isSingleButton = primaryButton && !secondaryButton && !linkButton;

  return (
    <Container $size={size}>
      <ButtonsContainer $size={size} $isSingleButton={isSingleButton ?? false}>
        {secondaryButton && (
          <Button
            id={secondaryButton.id}
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
            id={primaryButton.id}
            disabled={primaryButton.disabled}
            form={primaryButton.form}
            loading={primaryButton.loading}
            loadingAriaLabel={primaryButton.loadingAriaLabel}
            onClick={primaryButton.onClick}
            type={primaryButton.type}
            variant="primary"
          >
            {primaryButton.label}
          </Button>
        )}
      </ButtonsContainer>
      {linkButton && (
        <LinkButton onClick={linkButton.onClick} type={linkButton.type} form={linkButton.form}>
          {linkButton.label}
        </LinkButton>
      )}
    </Container>
  );
};

const Container = styled.footer<{ $size: DialogSize }>`
  ${({ theme, $size }) => css`
    display: flex;
    width: 100%;
    flex-direction: row-reverse;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
    flex: 0 0 auto;
    background-color: ${theme.backgroundColor.primary};
    z-index: 1;
    border-top: ${theme.borderWidth[1]} solid ${$size === 'full-screen' ? theme.borderColor.tertiary : 'transparent'};
  `}
`;

const ButtonsContainer = styled(Stack)<{ $size: DialogSize; $isSingleButton: boolean }>`
  ${({ theme, $size, $isSingleButton }) => css`
    flex-direction: column-reverse;
    width: 100%;
    gap: ${theme.spacing[3]};

    ${media.greaterThan('sm')`
      flex-direction: row;
      justify-content: ${$size === 'full-screen' && !$isSingleButton ? 'space-between' : 'flex-end'};
    `}
  `}
`;

export default Footer;

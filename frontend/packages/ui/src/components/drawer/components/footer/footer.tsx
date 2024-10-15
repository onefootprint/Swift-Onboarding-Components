import styled, { css } from 'styled-components';
import Button from '../../../button';
import LinkButton from '../../../link-button';
import Stack from '../../../stack';

type FooterProps = {
  linkButton?: {
    label: string;
    onClick: () => void;
  };
  secondaryButton?: {
    label: string;
    form?: string;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  };
  primaryButton?: {
    label: string;
    form?: string;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  };
};
const FOOTER_HEIGHT = '56px';

const Footer: React.FC<FooterProps> = ({ linkButton, secondaryButton, primaryButton }) => {
  const shouldShowFooter = linkButton || secondaryButton || primaryButton;

  if (!shouldShowFooter) return null;

  return (
    <StyledFooter justify="space-between" align="center" tag="footer">
      <Stack flex={1}>{linkButton && <LinkButton onClick={linkButton.onClick}>{linkButton.label}</LinkButton>}</Stack>
      <Stack direction="row" gap={3}>
        {secondaryButton && (
          <Button
            form={secondaryButton.form}
            loading={secondaryButton.loading}
            onClick={secondaryButton.onClick}
            type={secondaryButton.type}
            variant="secondary"
          >
            {secondaryButton.label}
          </Button>
        )}
        {primaryButton && (
          <Button
            form={primaryButton.form}
            loading={primaryButton.loading}
            onClick={primaryButton.onClick}
            type={primaryButton.type}
            variant="primary"
          >
            {primaryButton.label}
          </Button>
        )}
      </Stack>
    </StyledFooter>
  );
};

const StyledFooter = styled(Stack)`
  ${({ theme }) => css`
    bottom: 0;
    z-index: ${theme.zIndex.drawer};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[4]} ${theme.spacing[7]};
    height: ${FOOTER_HEIGHT};
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
  `}
`;

export default Footer;

import React from 'react';
import styled, { css } from 'styled-components';

import Button from '../../button';
import LinkButton from '../../link-button';
import type { ButtonVariant } from '../../split-button/split-button.types';
import Stack from '../../stack';
import type { DialogButton, FooterProps } from '../dialog.types';

const Footer = ({
  primaryButton,
  secondaryButton,
  linkButton,
}: FooterProps) => {
  const renderButton = ({
    variant,
    disabled = false,
    form = '',
    loading = false,
    loadingAriaLabel = '',
    onClick = () => {},
    type = 'button',
    label,
  }: DialogButton) => (
    <Button
      disabled={disabled}
      form={form}
      loading={loading}
      loadingAriaLabel={loadingAriaLabel}
      onClick={onClick}
      type={type}
      variant={variant as ButtonVariant}
    >
      {label}
    </Button>
  );

  const renderLinkButton = ({
    form = '',
    label,
    onClick = () => {},
    type = 'button',
  }: DialogButton) => (
    <LinkButton form={form} onClick={onClick} type={type} variant="label-4">
      {label}
    </LinkButton>
  );

  return primaryButton || secondaryButton || linkButton ? (
    <Container
      tag="footer"
      justify={linkButton ? 'space-between' : 'flex-end'}
      align="center"
      overflow="hidden"
      gap={3}
    >
      {linkButton && renderLinkButton(linkButton)}
      <Stack gap={3}>
        {secondaryButton &&
          renderButton({
            ...secondaryButton,
            variant: 'secondary',
          })}
        {primaryButton &&
          renderButton({
            ...primaryButton,
            variant: 'primary',
          })}
      </Stack>
    </Container>
  ) : null;
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]} ${theme.spacing[7]} ${theme.spacing[5]}
      ${theme.spacing[7]};

    button {
      white-space: nowrap;
    }
  `}
`;

export default Footer;

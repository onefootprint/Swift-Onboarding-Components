import { Button, Text } from '@onefootprint/ui';
import React from 'react';
import type { PermissionGateProps } from 'src/components/permission-gate';
import PermissionGate from 'src/components/permission-gate';
import styled, { css } from 'styled-components';

type SectionTitleProps = {
  title: string;
  button?: {
    label: string;
    onClick: () => void;
    role?: {
      scopeKind: PermissionGateProps['scopeKind'];
      fallbackText: string;
    };
  };
};

const SectionTitle = ({ title, button }: SectionTitleProps) => {
  let buttonComponent;
  if (button) {
    buttonComponent = (
      <Button variant="secondary" onClick={button.onClick} size="compact">
        {button.label}
      </Button>
    );

    if (button.role) {
      buttonComponent = (
        <PermissionGate fallbackText={button.role.fallbackText} scopeKind={button.role.scopeKind}>
          {buttonComponent}
        </PermissionGate>
      );
    }
  }

  return (
    <Container>
      <Text variant="label-2">{title}</Text>
      {buttonComponent}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    gap: ${theme.spacing[3]};
    padding-bottom: ${theme.spacing[3]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default SectionTitle;

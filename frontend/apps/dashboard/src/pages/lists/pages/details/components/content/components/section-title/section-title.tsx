import { Button, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type SectionTitleProps = {
  title: string;
  button?: {
    label: string;
    onClick: () => void;
  };
};

const SectionTitle = ({ title, button }: SectionTitleProps) => (
  <Container>
    <Text variant="label-1">{title}</Text>
    {button && (
      <Button variant="secondary" onClick={button.onClick}>
        {button.label}
      </Button>
    )}
  </Container>
);

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

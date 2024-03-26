import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type SectionTitleProps = {
  title: string;
};

const SectionTitle = ({ title }: SectionTitleProps) => (
  <Container>
    <Text variant="label-3">{title}</Text>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.spacing[3]};
    padding-bottom: ${theme.spacing[3]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default SectionTitle;

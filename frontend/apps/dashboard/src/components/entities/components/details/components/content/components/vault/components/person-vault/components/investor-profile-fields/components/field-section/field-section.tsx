import { Box, Text } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

type FieldSectionProps = {
  title: string;
  children: React.ReactNode;
};

const FieldSection = ({ title, children }: FieldSectionProps) => (
  <Box>
    <Text variant="label-2" marginBottom={5}>
      {title}
    </Text>
    <FieldsContainer>{children}</FieldsContainer>
  </Box>
);

const FieldsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
    flex-direction: column;

    p {
      max-width: 50%;
    }
  `};
`;

export default FieldSection;

import styled, { css } from '@onefootprint/styled';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type FieldSectionProps = {
  title: string;
  children: React.ReactNode;
};

const FieldSection = ({ title, children }: FieldSectionProps) => (
  <Box>
    <Typography variant="label-2" sx={{ marginBottom: 5 }}>
      {title}
    </Typography>
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

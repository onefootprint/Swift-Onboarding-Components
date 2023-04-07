import { Box, Shimmer } from '@onefootprint/ui';
import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled-components';

const Loading = () => (
  <Container data-testid="business-owners-loading">
    {times(2).map(value => (
      <Field key={value}>
        <LabelContainer>
          <Label />
          <Hint />
        </LabelContainer>
        <Box>
          <FieldOrPlaceholder />
        </Box>
      </Field>
    ))}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[4]};
  `};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `};
`;

const Label = () => <Shimmer sx={{ height: '20px', width: '117px' }} />;

const Hint = () => <Shimmer sx={{ height: '16px', width: '388px' }} />;

const FieldOrPlaceholder = () => (
  <Shimmer sx={{ height: '20px', width: '105px' }} />
);

export default Loading;

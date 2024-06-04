import { Box, Grid, Shimmer } from '@onefootprint/ui';
import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled-components';

const Loading = () => (
  <Grid.Container gap={4} data-testid="business-owners-loading">
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
  </Grid.Container>
);

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

const Label = () => <Shimmer height="20px" width="117px" />;

const Hint = () => <Shimmer height="16px" width="388px" />;

const FieldOrPlaceholder = () => <Shimmer height="20px" width="105" />;

export default Loading;

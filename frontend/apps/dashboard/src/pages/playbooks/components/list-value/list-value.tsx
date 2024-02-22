import { IcoCloseSmall24 } from '@onefootprint/icons';
import { Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type ListValueProps = {
  value: string[];
  threshold?: number;
};

const ListValue = ({ value, threshold = 3 }: ListValueProps) => {
  if (value.length === 0) {
    return <IcoCloseSmall24 testID="no-value-icon" />;
  }

  if (value.length <= threshold) {
    return (
      <Container>
        <Typography variant="body-3">{value.join(', ')}</Typography>
      </Container>
    );
  }

  const first = value.slice(0, threshold);
  const remaining = value.slice(threshold);
  return (
    <Container>
      <Typography variant="body-3">{first.join(', ')}</Typography>
      <Tooltip text={remaining.join(', ')} alignment="center" position="bottom">
        <>
          <Typography variant="body-3">and </Typography>{' '}
          <Typography variant="body-3" sx={{ textDecoration: 'underline' }}>
            {`${remaining.length} more`}
          </Typography>
        </>
      </Tooltip>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: ${theme.spacing[2]};
  `}
`;

export default ListValue;

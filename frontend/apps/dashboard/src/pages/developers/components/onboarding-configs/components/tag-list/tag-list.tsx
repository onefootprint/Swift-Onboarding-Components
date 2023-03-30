import { Tag } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type TagListProps = {
  items: string[];
  testID?: string;
};

const TagList = ({ testID, items }: TagListProps) => (
  <Container data-testid={testID}>
    {items.map(item => (
      <Tag key={`${testID}-${item}`}>{item}</Tag>
    ))}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
  `}
`;

export default TagList;

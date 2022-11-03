import { CollectedKycDataOption } from '@onefootprint/types';
import { Tag } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type TagListProps = {
  dataList: CollectedKycDataOption[];
  getLabel: (data: CollectedKycDataOption) => string;
  testID: string;
};

const TagList = ({ dataList, testID, getLabel }: TagListProps) => (
  <Container data-testid={testID}>
    {dataList.map(data => (
      <Tag key={`${testID}-${data}`}>{getLabel(data)}</Tag>
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

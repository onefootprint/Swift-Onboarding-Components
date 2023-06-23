import { useTranslation } from '@onefootprint/hooks';
import { Tag } from '@onefootprint/ui';
import React from 'react';
import { getDI } from 'src/components/entities/utils/get-dis';
import styled, { css } from 'styled-components';

export type FieldTagListProps = {
  targets: string[];
};

const FieldTagList = ({ targets }: FieldTagListProps) => {
  const { t } = useTranslation('');

  const tags = targets
    .map((target: string) => t(getDI(target)))
    .filter(tag => tag.length > 0);

  return (
    <FieldListContainer>
      {tags.map((tag: string) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </FieldListContainer>
  );
};

const FieldListContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
  `}
`;

export default FieldTagList;

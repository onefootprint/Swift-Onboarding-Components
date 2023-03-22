import { useTranslation } from '@onefootprint/hooks';
import { Box, Tag } from '@onefootprint/ui';
import React from 'react';

type FieldTagListProps = {
  targets: string[];
};

const FieldTagList = ({ targets }: FieldTagListProps) => {
  const { t } = useTranslation('');
  const tags = targets
    .map((target: string) => t(`di.${target}`))
    .filter(tag => tag.length > 0);

  return (
    <>
      {tags.map((tag: string, index: number) => (
        <span key={tag}>
          <Box sx={{ display: 'inline-block', marginLeft: 1 }} />
          <Tag>{tag}</Tag>
          {index < tags.length - 1 && (
            <Box sx={{ display: 'inline-block', marginRight: 1 }} />
          )}
        </span>
      ))}
    </>
  );
};

export default FieldTagList;

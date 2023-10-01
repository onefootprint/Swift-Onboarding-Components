import { useTranslation } from '@onefootprint/hooks';
import { Tag } from '@onefootprint/ui';
import React from 'react';
import { getDI } from 'src/components/entities/utils/get-dis';

export type FieldTagListProps = {
  targets: string[];
};

const FieldTagList = ({ targets }: FieldTagListProps) => {
  const { t } = useTranslation('');

  const tags = targets
    .map((target: string) => t(getDI(target)))
    .filter(tag => tag.length > 0);

  return (
    <>
      {tags.map((tag: string) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </>
  );
};

export default FieldTagList;

import { Tag } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getDI } from 'src/components/entities/utils/get-dis';

export type FieldTagListProps = {
  targets: string[];
};

const FieldTagList = ({ targets }: FieldTagListProps) => {
  const { t } = useTranslation('common');

  const tags = targets.map((target: string) => t(getDI(target) as ParseKeys<'common'>)).filter(tag => tag.length > 0);

  return (
    <>
      {tags.map((tag: string) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </>
  );
};

export default FieldTagList;

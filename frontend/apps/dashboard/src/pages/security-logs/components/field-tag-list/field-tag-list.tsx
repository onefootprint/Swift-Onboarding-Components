import { useTranslation } from '@onefootprint/hooks';
import { Box, Tag } from '@onefootprint/ui';
import React from 'react';

type FieldTagListProps = {
  targets: string[];
};

const FieldTagList = ({ targets }: FieldTagListProps) => {
  const { t } = useTranslation('');

  const tags = targets
    .map((target: string) => {
      const parts = target.split('.');
      if (parts.length === 2) {
        const [prefix, label] = parts;
        if (prefix === 'id') {
          return t(`user-data-attributes.${label}`);
        }
        if (prefix === 'custom') {
          // TODO better formatting for custom data tags
          return target;
        }
        if (prefix === 'id_document') {
          return t(`id-doc-type.${label}`);
        }
        if (prefix === 'selfie') {
          return t('id-doc-type.selfie');
        }
      }
      return '';
    })
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

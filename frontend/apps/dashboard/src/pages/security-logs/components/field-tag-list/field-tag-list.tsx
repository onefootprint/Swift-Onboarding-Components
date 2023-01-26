import { useTranslation } from '@onefootprint/hooks';
import { Tag } from '@onefootprint/ui';
import React from 'react';

type FieldTagListProps = {
  targets: string[];
};

const FieldTagList = ({ targets }: FieldTagListProps) => {
  const { allT } = useTranslation('');

  const tags = targets
    .map((target: string) => {
      const parts = target.split('.');
      if (parts.length === 2) {
        const [prefix, label] = parts;
        if (prefix === 'id') {
          return allT(`user-data-attributes.${label}`);
        }
        if (prefix === 'custom') {
          // TODO better formatting for custom data tags
          return target;
        }
        if (prefix === 'id_document') {
          return allT(`id-doc-type.${label}`);
        }
        if (prefix === 'selfie') {
          return allT('id-doc-type.selfie');
        }
      }
      return '';
    })
    .filter(tag => tag.length > 0);

  return (
    <>
      {tags.map((tag: string, i: number) => (
        <span key={`${tag}`}>
          <Tag>{tag}</Tag>
          {i !== targets.length - 1 && <span>, </span>}
        </span>
      ))}
    </>
  );
};

export default FieldTagList;

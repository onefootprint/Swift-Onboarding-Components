import { dataKindToDisplayName } from '@onefootprint/types';
import { Tag } from '@onefootprint/ui';
import React from 'react';

type FieldTagListProps = {
  targets: string[];
};

const FieldTagList = ({ targets }: FieldTagListProps) => (
  <>
    {targets.map((target: string, i: number) => {
      const parts = target.split('.');
      const prefix = parts[0];
      let text;
      if (prefix === 'id') {
        const dataAttribute = parts[parts.length - 1];
        text = dataKindToDisplayName[dataAttribute];
      } else if (prefix === 'custom') {
        // TODO better formatting for custom data tags
        text = target;
      } else {
        text = target;
      }
      return (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`${target}-${i}`}>
          <Tag>{text}</Tag>
          {i !== targets.length - 1 && <span>, </span>}
        </span>
      );
    })}
  </>
);

export default FieldTagList;

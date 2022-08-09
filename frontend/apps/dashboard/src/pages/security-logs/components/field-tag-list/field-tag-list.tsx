import React from 'react';
import { DataKinds, dataKindToDisplayName } from 'src/types';
import { Tag } from 'ui';

type FieldTagListProps = {
  dataKinds: DataKinds[];
};

const FieldTagList = ({ dataKinds }: FieldTagListProps) => (
  <>
    {dataKinds.map((dataKind: DataKinds, i: number) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={`${dataKind}-${i}`}>
        <Tag>{dataKindToDisplayName[dataKind]}</Tag>
        {i !== dataKinds.length - 1 && <span>, </span>}
      </span>
    ))}
  </>
);

export default FieldTagList;

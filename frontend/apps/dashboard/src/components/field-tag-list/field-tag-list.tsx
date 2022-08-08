import React from 'react';
import { DataKind, dataKindToDisplayName } from 'src/types';
import { Tag } from 'ui';

type FieldTagListProps = {
  dataKinds: DataKind[];
};

const FieldTagList = ({ dataKinds }: FieldTagListProps) => (
  <>
    {dataKinds.map((dataKind: DataKind, i: number) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={`${dataKind}-${i}`}>
        <Tag>{dataKindToDisplayName[dataKind]}</Tag>
        {i !== dataKinds.length - 1 && <span>, </span>}
      </span>
    ))}
  </>
);

export default FieldTagList;

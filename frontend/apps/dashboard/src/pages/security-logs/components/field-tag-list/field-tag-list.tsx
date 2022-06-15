import React from 'react';
import FieldTag from 'src/components/field-tag';
import { DataKind } from 'src/types';

type FieldTagListProps = {
  dataKinds: DataKind[];
};

const FieldTagList = ({ dataKinds }: FieldTagListProps) => (
  <>
    {dataKinds.map((dataKind: DataKind, i: number) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={`${dataKind}-${i}`}>
        <FieldTag dataKind={dataKind} />
        {i !== dataKinds.length - 1 && <span>, </span>}
      </span>
    ))}
  </>
);

export default FieldTagList;

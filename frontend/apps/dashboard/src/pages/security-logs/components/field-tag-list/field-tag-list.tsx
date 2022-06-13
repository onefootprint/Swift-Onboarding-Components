import FieldTag from '@src/components/field-tag';
import { DataKind } from '@src/pages/users/hooks/use-decrypt-user';
import React from 'react';

type FieldTagListProps = {
  dataKinds: DataKind[];
};

const FieldTagList = ({ dataKinds }: FieldTagListProps) => (
  <>
    {dataKinds.map((dataKind: DataKind, i: number) => (
      <>
        <FieldTag dataKind={dataKind} key={dataKind} />
        {i !== dataKinds.length - 1 && <span>, </span>}
      </>
    ))}
  </>
);

export default FieldTagList;

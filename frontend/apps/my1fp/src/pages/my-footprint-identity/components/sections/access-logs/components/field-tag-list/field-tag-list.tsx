import React, { Fragment } from 'react';

import { DataKind } from '../../types';
import FieldTag from '../field-tag';

type FieldTagListProps = {
  dataKinds: DataKind[];
};

const FieldTagList = ({ dataKinds }: FieldTagListProps) => {
  // Since we are going to use the dataKind as the key, make sure there are no dupes
  const uniqueDataKinds = Array.from(new Set(dataKinds));

  return (
    <>
      {uniqueDataKinds.map((dataKind: DataKind, i: number) => (
        <Fragment key={dataKind}>
          <FieldTag dataKind={dataKind} />
          {i !== dataKinds.length - 1 && <span>, </span>}
        </Fragment>
      ))}
    </>
  );
};

export default FieldTagList;

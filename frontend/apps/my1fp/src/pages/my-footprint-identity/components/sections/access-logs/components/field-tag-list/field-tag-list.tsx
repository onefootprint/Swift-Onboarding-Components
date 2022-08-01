import React, { Fragment } from 'react';
import { Tag } from 'ui';

import { DataKind, dataKindToDisplayName } from '../../types';

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
          <Tag>{dataKindToDisplayName[dataKind]}</Tag>
          {i !== dataKinds.length - 1 && <span>, </span>}
        </Fragment>
      ))}
    </>
  );
};

export default FieldTagList;

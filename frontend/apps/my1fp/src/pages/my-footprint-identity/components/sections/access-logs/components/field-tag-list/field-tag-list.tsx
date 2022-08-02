import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles } from 'ui/src/utils/mixins/mixins';

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
          <StyledTag>{dataKindToDisplayName[dataKind]}</StyledTag>
          {i !== dataKinds.length - 1 && <span>, </span>}
        </Fragment>
      ))}
    </>
  );
};

const StyledTag = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-4')};
    background-color: ${theme.backgroundColor.neutral};
    border-radius: ${theme.borderRadius[1]}px;
    color: ${theme.color.neutral};
    padding: ${theme.spacing[1]}px ${theme.spacing[2]}px;
  `};
`;

export default FieldTagList;

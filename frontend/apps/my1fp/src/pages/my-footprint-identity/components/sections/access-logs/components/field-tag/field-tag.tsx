import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

import { DataKind, dataKindToDisplayName } from '../../types';

type FieldTagProps = {
  dataKind: DataKind;
};

const FieldTag = ({ dataKind }: FieldTagProps) => (
  <FieldTagContainer>
    <Typography as="span" variant="label-4">
      {dataKindToDisplayName[dataKind]}
    </Typography>
  </FieldTagContainer>
);

const FieldTagContainer = styled.span`
  white-space: nowrap;
  line-height: 28px;

  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.neutral};
    padding: ${theme.spacing[1]}px ${theme.spacing[2]}px;
    border-radius: ${theme.borderRadius[1]}px;
  `};
`;

export default FieldTag;

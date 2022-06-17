import React from 'react';
import { DataKind, dataKindToDisplayName } from 'src/types';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

type FieldTagProps = {
  dataKind: DataKind;
};

const FieldTag = ({ dataKind }: FieldTagProps) => (
  <StyledFieldTag>{dataKindToDisplayName[dataKind]}</StyledFieldTag>
);

const StyledFieldTag = styled(Typography).attrs({
  as: 'span',
  variant: 'label-4',
})`
  ${({ theme }) => css`
    color: ${theme.color.neutral};
    background-color: ${theme.backgroundColor.neutral};
    padding: ${theme.spacing[1]}px ${theme.spacing[2]}px;
    border-radius: ${theme.borderRadius[1]}px;
  `};
`;

export default FieldTag;

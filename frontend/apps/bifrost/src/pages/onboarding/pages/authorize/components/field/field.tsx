import { Icon } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type FieldProps = {
  label: string;
  IconComponent: Icon;
};

const Field = ({ label, IconComponent }: FieldProps) => (
  <Category>
    <IconContainer>
      <IconComponent />
    </IconContainer>
    <Typography variant="label-3">{label}</Typography>
  </Category>
);

const IconContainer = styled.span`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[2]};
  `}
`;

const Category = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
`;

export default Field;

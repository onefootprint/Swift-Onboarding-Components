import styled, { css } from '@onefootprint/styled';
import React from 'react';

import type { FieldProps } from '../field';
import Field from '../field';

type FieldsListProps = {
  fields: FieldProps[];
};

const FieldsList = ({ fields }: FieldsListProps) => (
  <Container>
    {fields.map(field => (
      <Field
        key={field.label}
        label={field.label}
        IconComponent={field.IconComponent}
      />
    ))}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr auto;
    width: 100%;
    gap: ${theme.spacing[4]};
  `}
`;

export default FieldsList;

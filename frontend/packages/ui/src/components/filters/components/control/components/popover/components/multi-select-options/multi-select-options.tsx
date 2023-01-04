import React from 'react';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import Checkbox from '../../../../../../../checkbox';
import type { FilterMultiSelect } from '../../../../../../filters.types';

const MultiSelectGroupedOptions = ({ options }: FilterMultiSelect) => {
  const { register } = useFormContext();

  return (
    <Container>
      {options.map(option => (
        <Checkbox
          key={`${option.label}-${option.value}`}
          label={option.label}
          value={option.value}
          {...register('filter')}
        />
      ))}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default MultiSelectGroupedOptions;

import React from 'react';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import Checkbox from '../../../../../../../checkbox';
import Typography from '../../../../../../../typography';
import type { FilterMultiSelectGrouped } from '../../../../../../filters.types';

const MultiSelectGroupedOptions = ({ options }: FilterMultiSelectGrouped) => {
  const { register } = useFormContext();

  return (
    <Container>
      {options.map(group => (
        <Fieldset key={group.label}>
          <Typography variant="label-3" sx={{ marginBottom: 3 }}>
            {group.label}
          </Typography>
          {group.options.map(option => (
            <Checkbox
              key={`${option.label}-${option.value}`}
              label={option.label}
              value={option.value}
              {...register('filter')}
            />
          ))}
        </Fieldset>
      ))}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[7]};
  `}
`;

const Fieldset = styled.fieldset`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default MultiSelectGroupedOptions;

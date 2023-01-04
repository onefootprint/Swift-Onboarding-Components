import noop from 'lodash/noop';
import React from 'react';
import styled, { css } from 'styled-components';

import Typography from '../typography';
import Control from './components/control';
import type { FilterControl, FilterSelectedOption } from './filters.types';

export type FiltersProps = {
  controls: FilterControl[];
  label?: string;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  onChange?: (query: string, options: FilterSelectedOption[]) => void;
};

const Filters = ({
  controls,
  label = 'Filter by',
  primaryButtonLabel = 'Apply',
  secondaryButtonLabel = 'Cancel',
  onChange = noop,
}: FiltersProps) => (
  <FilterContainer>
    <Typography color="tertiary" variant="label-4" as="label">
      {label}
    </Typography>
    <Controls>
      {controls.map(control => (
        <Control
          control={control}
          key={control.query}
          onChange={onChange}
          primaryButtonLabel={primaryButtonLabel}
          secondaryButtonLabel={secondaryButtonLabel}
        />
      ))}
    </Controls>
  </FilterContainer>
);

const FilterContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[4]};
  `}
`;

const Controls = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
    justify-content: center;
  `}
`;

export default Filters;

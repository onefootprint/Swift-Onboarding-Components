import styled, { css } from '@onefootprint/styled';
import noop from 'lodash/noop';
import React from 'react';

import LinkButton from '../link-button';
import Typography from '../typography';
import Control from './components/control';
import type { FilterControl, FilterSelectedOption } from './filters.types';

export type FiltersProps = {
  controls: FilterControl[];
  onChange?: (
    query: string,
    options: FilterSelectedOption | FilterSelectedOption[],
  ) => void;
  onClear?: () => void;
};

const Filters = ({
  controls,
  onChange = noop,
  onClear = noop,
}: FiltersProps) => {
  const hasSelectedOptions = controls.some(
    control => control.selectedOptions && control.selectedOptions.length > 0,
  );

  return (
    <FilterContainer>
      <Typography color="tertiary" variant="label-4" as="label">
        Filter by
      </Typography>
      <Controls>
        {controls.map(control => (
          <Control control={control} key={control.query} onChange={onChange} />
        ))}
      </Controls>
      {hasSelectedOptions && (
        <LinkButton onClick={onClear} size="compact">
          Clear filters
        </LinkButton>
      )}
    </FilterContainer>
  );
};

const FilterContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
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

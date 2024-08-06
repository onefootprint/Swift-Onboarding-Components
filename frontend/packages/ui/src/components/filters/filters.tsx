import noop from 'lodash/noop';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import LinkButton from '../link-button';
import Control from './components/control';
import type { FilterControl, FilterSelectedOption } from './filters.types';

export type FiltersProps = {
  controls: FilterControl[];
  onChange?: (query: string, options: FilterSelectedOption | FilterSelectedOption[]) => void;
  onClear?: () => void;
};

const Filters = ({ controls, onChange = noop, onClear = noop }: FiltersProps) => {
  const { t } = useTranslation('ui');
  const hasSelectedOptions = controls.some(control => control.selectedOptions && control.selectedOptions.length > 0);

  return (
    <FilterContainer>
      <Controls>
        {controls.map(control => (
          <Control control={control} disabled={control.disabled} key={control.query} onChange={onChange} />
        ))}
      </Controls>
      {hasSelectedOptions && (
        <ClearFiltersContainer>
          <LinkButton onClick={onClear}>{t('components.filters.clear-filters')}</LinkButton>
        </ClearFiltersContainer>
      )}
    </FilterContainer>
  );
};

const ClearFiltersContainer = styled.div`
  ${({ theme }) => css`
    height: ${theme.spacing[8]};
    display: flex;
    flex-direction: column;
    justify-content: center;
    white-space: nowrap;
  `}
`;

const FilterContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    align-items: flex-start;
    justify-content: space-between;
    display: flex;
    gap: ${theme.spacing[4]};
  `}
`;

const Controls = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[3]};
    justify-content: flex-start;
  `}
`;

export default Filters;

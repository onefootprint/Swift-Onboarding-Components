/* eslint-disable react/jsx-props-no-spreading */
import React, { useId, useState } from 'react';
import styled, { css } from 'styled-components';

import Box from '../../../box';
import Fade from '../../../fade';
import LoadingIndicator from '../../../loading-indicator';
import type { FilterControl, FilterSelectedOption } from '../../filters.types';
import AddPill from './components/add-pill';
import ClearPill from './components/clear-pill';
import DateForm from './components/date-form';
import MultiSelectGroupedForm from './components/multi-select-grouped-form';
import Popover from './components/popover';
import SelectForm from './components/select-form';
import { SelectFormKind } from './components/select-form/select-form';
import SelectedPill from './components/selected-pill';
import useDateOptions from './hooks/use-date-options';
import usePopper from './hooks/use-popper';
import getDateLabel from './utils/get-date-label';
import getMultiSelectGroupedLabel from './utils/get-multi-select-grouped-label';
import getMultiSelectLabel from './utils/get-multi-select-label';
import getSingleSelectLabel from './utils/get-single-select-label/get-single-select-label';

export type ControlProps = {
  control: FilterControl;
  onChange: (
    query: string,
    newSelectedOptions: FilterSelectedOption | FilterSelectedOption[],
  ) => void;
};

const Control = ({ control, onChange }: ControlProps) => {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const dateOptions = useDateOptions();
  const { query, kind, label, loading, options, selectedOptions } = control;
  const hasSelectedOptions = selectedOptions && selectedOptions.length > 0;
  const { attributes, setReferenceElement, setPopperElement } = usePopper();

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const close = () => {
    setOpen(false);
  };

  const clear = () => {
    onChange(query, []);
  };

  const handleSubmit = (
    newSelectedOptions: FilterSelectedOption | FilterSelectedOption[],
  ) => {
    onChange(query, newSelectedOptions);
    setOpen(false);
  };

  return (
    <Box
      ref={setReferenceElement}
      aria-busy={loading}
      sx={{ position: 'relative' }}
    >
      {hasSelectedOptions ? (
        <PillGroup>
          <ClearPill onClick={clear}>{label}</ClearPill>
          <SelectedPillMotion
            isVisible={hasSelectedOptions}
            from="left"
            to="right"
          >
            <SelectedPill
              aria-controls={popoverId}
              aria-expanded={open}
              aria-haspopup="dialog"
              onClick={handleToggle}
            >
              {kind === 'single-select' &&
                getSingleSelectLabel(options, selectedOptions)}
              {kind === 'multi-select' &&
                getMultiSelectLabel(options, selectedOptions)}
              {kind === 'multi-select-grouped' &&
                getMultiSelectGroupedLabel(options, selectedOptions)}
              {kind === 'date' && getDateLabel(dateOptions, selectedOptions)}
            </SelectedPill>
          </SelectedPillMotion>
        </PillGroup>
      ) : (
        <AddPill
          aria-controls={popoverId}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={handleToggle}
        >
          {label}
        </AddPill>
      )}

      {open ? (
        <StyledFade
          isVisible={open}
          from="center"
          to="center"
          ref={setPopperElement}
          {...attributes.popper}
        >
          <Popover id={popoverId} onClose={close} title={label}>
            {loading ? (
              <LoadingIndicator
                color="secondary"
                size="compact"
                aria-label={`Loading ${label}`}
              />
            ) : (
              <>
                {kind === 'single-select' && (
                  <SelectForm
                    kind={SelectFormKind.singleSelect}
                    onSubmit={handleSubmit}
                    options={options}
                    selectedOptions={selectedOptions}
                  />
                )}
                {kind === 'multi-select' && (
                  <SelectForm
                    kind={SelectFormKind.multiSelect}
                    onSubmit={handleSubmit}
                    options={options}
                    selectedOptions={selectedOptions}
                  />
                )}
                {kind === 'multi-select-grouped' && (
                  <MultiSelectGroupedForm
                    onSubmit={handleSubmit}
                    options={options}
                    selectedOptions={selectedOptions}
                  />
                )}
                {kind === 'date' && (
                  <DateForm
                    onSubmit={handleSubmit}
                    selectedOptions={selectedOptions}
                  />
                )}
              </>
            )}
          </Popover>
        </StyledFade>
      ) : null}
    </Box>
  );
};

const SelectedPillMotion = styled(Fade)`
  && {
    ${({ theme }) => css`
      button:first-of-type {
        color: ${theme.color.primary};
        border-left: none;
        border-radius: 0 ${theme.borderRadius.default}
          ${theme.borderRadius.default} 0;
      }
    `}
  }
`;

const PillGroup = styled.div`
  display: flex;

  button:first-of-type {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`;

const StyledFade = styled(Fade)`
  ${({ theme }) => css`
    z-index: ${theme.zIndex.dialog};
    position: absolute;
    margin-top: ${theme.spacing[3]};
  `}
`;

export default Control;

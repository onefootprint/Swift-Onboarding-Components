/* eslint-disable react/jsx-props-no-spreading */
import React, { useId, useState } from 'react';
import styled, { css } from 'styled-components';

import Box from '../../../box';
import type { FilterControl, FilterSelectedOption } from '../../filters.types';
import AddPill from './components/add-pill';
import ClearPill from './components/clear-pill';
import DateForm from './components/date-form';
import MultiSelectForm from './components/multi-select-form';
import MultiSelectGroupedForm from './components/multi-select-grouped-form';
import Popover from './components/popover';
import SelectedPill from './components/selected-pill';
import useDateOptions from './hooks/use-date-options';
import usePopper from './hooks/use-popper';
import getDateLabel from './utils/get-date-label';
import getMultiSelectGroupedLabel from './utils/get-multi-select-grouped-label';
import getMultiSelectLabel from './utils/get-multi-select-label';

export type ControlProps = {
  control: FilterControl;
  onChange: (query: string, newSelectedOptions: FilterSelectedOption[]) => void;
};

const Control = ({ control, onChange }: ControlProps) => {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const dateOptions = useDateOptions();
  const { query, kind, label, options, selectedOptions } = control;
  const hasSelectedOptions = selectedOptions.length > 0;
  const { styles, attributes, setReferenceElement, setPopperElement } =
    usePopper();

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const close = () => {
    setOpen(false);
  };

  const clear = () => {
    onChange(query, []);
  };

  const handleSubmit = (newSelectedOptions: FilterSelectedOption[]) => {
    onChange(query, newSelectedOptions);
    setOpen(false);
  };

  return (
    <>
      <Box ref={setReferenceElement}>
        {hasSelectedOptions ? (
          <PillGroup>
            <ClearPill onClick={clear}>{label}</ClearPill>
            <SelectedPill
              aria-controls={popoverId}
              aria-expanded={open}
              aria-haspopup="dialog"
              onClick={handleToggle}
            >
              {kind === 'multi-select' &&
                getMultiSelectLabel(options, selectedOptions)}
              {kind === 'multi-select-grouped' &&
                getMultiSelectGroupedLabel(options, selectedOptions)}
              {kind === 'date' && getDateLabel(dateOptions, selectedOptions)}
            </SelectedPill>
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
      </Box>
      {open ? (
        <div
          {...attributes.popper}
          ref={setPopperElement}
          style={styles.popper}
        >
          <Popover id={popoverId} onClose={close} title={control.label}>
            {kind === 'multi-select' && (
              <MultiSelectForm
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
          </Popover>
        </div>
      ) : null}
    </>
  );
};

const PillGroup = styled.div`
  display: flex;

  button:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  button:last-child {
    ${({ theme }) => css`
      color: ${theme.color.primary};
      border-left: none;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    `}
  }
`;

export default Control;

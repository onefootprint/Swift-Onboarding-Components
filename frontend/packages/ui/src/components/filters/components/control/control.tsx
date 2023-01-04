import React, { useId, useState } from 'react';
import styled, { css } from 'styled-components';

import Box from '../../../box';
import type { FilterControl, FilterSelectedOption } from '../../filters.types';
import AddPill from './components/add-pill';
import ClearPill from './components/clear-pill';
import Popover from './components/popover';
import SelectedPill from './components/selected-pill';
import usePopper from './hooks/use-popper';
import getMultiSelectGroupedLabel from './utils/get-multi-select-grouped-label';
import getMultiSelectLabel from './utils/get-multi-select-label';

export type ControlProps = {
  control: FilterControl;
  onChange: (query: string, newSelectedOptions: FilterSelectedOption[]) => void;
  primaryButtonLabel: string;
  secondaryButtonLabel: string;
};

const Control = ({
  control,
  onChange,
  primaryButtonLabel,
  secondaryButtonLabel,
}: ControlProps) => {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const { query, kind, label, options, selectedOptions } = control;
  const hasSelectedOptions = selectedOptions.length > 0;
  const { styles, attributes, setReferenceElement, setPopperElement } =
    usePopper();

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClear = () => {
    onChange(query, []);
  };

  const handleChange = (newSelectedOptions: FilterSelectedOption[]) => {
    onChange(query, newSelectedOptions);
  };

  return (
    <>
      <Box ref={setReferenceElement}>
        {hasSelectedOptions ? (
          <PillGroup>
            <ClearPill onClick={handleClear}>{label}</ClearPill>
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
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...attributes.popper}
          ref={setPopperElement}
          style={styles.popper}
        >
          <Popover
            control={control}
            id={popoverId}
            onChange={handleChange}
            onClose={handleClose}
            primaryButtonLabel={primaryButtonLabel}
            secondaryButtonLabel={secondaryButtonLabel}
          />
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

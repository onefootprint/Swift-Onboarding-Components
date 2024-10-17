'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { useId, useState } from 'react';
import styled, { css } from 'styled-components';

import { useTranslation } from 'react-i18next';
import Button from '../../../button';
import LoadingSpinner from '../../../loading-spinner';
import Popover from '../../../popover';
import ScrollArea from '../../../scroll-area';
import Stack from '../../../stack';
import Text from '../../../text';
import type { FilterControl, FilterSelectedOption } from '../../filters.types';
import AddPill from './components/add-pill';
import ClearPill from './components/clear-pill';
import DateForm from './components/date-form';
import MultiSelectGroupedForm from './components/multi-select-grouped-form';
import SelectForm, { SelectFormKind } from './components/select-form';
import SelectedPill from './components/selected-pill';
import useDateOptions from './hooks/use-date-options';
import getDateLabel from './utils/get-date-label';
import getMultiSelectGroupedLabel from './utils/get-multi-select-grouped-label';
import getMultiSelectLabel from './utils/get-multi-select-label';
import getSingleSelectLabel from './utils/get-single-select-label';

export type ControlProps = {
  control: FilterControl;
  disabled?: boolean;
  onChange: (query: string, newSelectedOptions: FilterSelectedOption | FilterSelectedOption[]) => void;
};

const Control = ({ control, disabled, onChange }: ControlProps) => {
  const { t } = useTranslation('ui');
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const dateOptions = useDateOptions();
  const { query, kind, label, loading, options, selectedOptions } = control;
  const hasSelectedOptions = selectedOptions && selectedOptions.length > 0;

  const close = () => {
    setOpen(false);
  };

  const clear = () => {
    onChange(query, []);
  };

  const handleSubmit = (newSelectedOptions: FilterSelectedOption | FilterSelectedOption[]) => {
    onChange(query, newSelectedOptions);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Stack direction="row">
          {hasSelectedOptions ? (
            <PillGroup>
              <ClearPill onClick={clear} disabled={disabled}>
                {label}
              </ClearPill>
              <SelectedPill aria-controls={popoverId} aria-expanded={open} aria-haspopup="dialog" disabled={disabled}>
                {kind === 'single-select' && getSingleSelectLabel(options, selectedOptions)}
                {kind === 'multi-select' && getMultiSelectLabel(options, selectedOptions)}
                {kind === 'multi-select-grouped' && getMultiSelectGroupedLabel(options, selectedOptions)}
                {kind === 'date' && getDateLabel(dateOptions, selectedOptions)}
              </SelectedPill>
            </PillGroup>
          ) : (
            <AddPill aria-controls={popoverId} aria-expanded={open} aria-haspopup="dialog" disabled={disabled}>
              {label}
            </AddPill>
          )}
        </Stack>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          minWidth="300px"
          aria-label={t('components.filters.filter-by', { label })}
        >
          <Header>
            <Text variant="label-3">{t('components.filters.filter-by', { label })}</Text>
          </Header>
          <ScrollArea padding={6}>
            {loading ? (
              <LoadingSpinner color="secondary" ariaLabel={`Loading ${label}`} size={24} />
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
                  <MultiSelectGroupedForm onSubmit={handleSubmit} options={options} selectedOptions={selectedOptions} />
                )}
                {kind === 'date' && <DateForm onSubmit={handleSubmit} selectedOptions={selectedOptions} />}
              </>
            )}
          </ScrollArea>
          <Footer>
            <Button onClick={close} variant="secondary">
              {t('components.filters.popover.cancel') as string}
            </Button>
            <Button form="filter-form" type="submit" variant="primary">
              {t('components.filters.popover.apply') as string}
            </Button>
          </Footer>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const PillGroup = styled.div`
  display: flex;

  button:first-of-type {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  button:last-of-type {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: 0;
  }
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[4]};
    justify-content: flex-end;
    padding: ${theme.spacing[4]};
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing[3]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default Control;

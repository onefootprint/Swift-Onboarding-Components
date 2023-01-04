import FocusTrap from 'focus-trap-react';
import React, { useId, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';
import {
  useEventListener,
  useLockedBody,
  useOnClickOutside,
} from 'usehooks-ts';

import Button from '../../../../../button';
import Typography from '../../../../../typography';
import type {
  FilterControl,
  FilterSelectedOption,
} from '../../../../filters.types';
import MultiSelectGroupedOptions from './components/multi-select-grouped-options';
import MultiSelectOptions from './components/multi-select-options';

type FormData = {
  filter: FilterSelectedOption[];
};

export type PopoverProps = {
  control: FilterControl;
  id: string;
  onClose: () => void;
  onChange: (newFilters: FilterSelectedOption[]) => void;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
};

const Popover = ({
  id,
  onClose,
  onChange,
  primaryButtonLabel = 'Apply',
  secondaryButtonLabel = 'Cancel',
  control,
}: PopoverProps) => {
  const { options, kind, selectedOptions, label: title } = control;
  const headerId = useId();
  const bodyId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside<HTMLDivElement>(containerRef, onClose);
  useLockedBody();
  useEventListener('keydown', event => {
    if (event.key === 'Escape') {
      onClose();
    }
  });
  const methods = useForm<FormData>({
    defaultValues: {
      filter: selectedOptions,
    },
  });
  const { handleSubmit } = methods;

  const handleAfterSubmit = (formData: FormData) => {
    onChange(formData.filter);
    onClose();
  };

  return (
    <FocusTrap>
      <PopoverContainer
        aria-describedby={bodyId}
        aria-label={title}
        aria-labelledby={headerId}
        id={id}
        ref={containerRef}
        role="dialog"
      >
        <Header id={headerId}>
          <Typography variant="label-3">{title}</Typography>
        </Header>
        <Body id={bodyId}>
          <FormProvider {...methods}>
            <form id="filter-form" onSubmit={handleSubmit(handleAfterSubmit)}>
              {kind === 'multi-select' && (
                <MultiSelectOptions
                  kind={kind}
                  options={options}
                  selectedOptions={selectedOptions}
                />
              )}
              {kind === 'multi-select-grouped' && (
                <MultiSelectGroupedOptions
                  kind={kind}
                  options={options}
                  selectedOptions={selectedOptions}
                />
              )}
            </form>
          </FormProvider>
        </Body>
        <Footer>
          <Button onClick={onClose} size="small" variant="secondary">
            {secondaryButtonLabel}
          </Button>
          <Button
            form="filter-form"
            size="small"
            type="submit"
            variant="primary"
          >
            {primaryButtonLabel}
          </Button>
        </Footer>
      </PopoverContainer>
    </FocusTrap>
  );
};

const PopoverContainer = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[3]};
    width: 300px;
    z-index: ${theme.zIndex.dialog};
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    height: 36px;
    justify-content: center;
    position: relative;
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[6]};
  `}
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

export default Popover;

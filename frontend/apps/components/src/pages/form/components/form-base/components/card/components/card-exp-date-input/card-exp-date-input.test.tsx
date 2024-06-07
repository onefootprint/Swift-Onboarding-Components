import { screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import { renderComponents } from '../../../../../../../../config/tests';
import type { CardExpDateInputProps } from './card-exp-date-input';
import CardExpDateInput from './card-exp-date-input';

describe('CardExpDateInput', () => {
  const renderCardExpDateInput = ({
    hasError,
    hint,
    invalidMessage = 'Invalid message',
    value,
    label = 'Expiration date',
  }: Partial<CardExpDateInputProps>) =>
    renderComponents(
      <CardExpDateInput hasError={hasError} hint={hint} label={label} invalidMessage={invalidMessage} value={value} />,
    );

  describe('when label is provided', () => {
    it('should render the label', () => {
      renderCardExpDateInput({ label: 'some label' });
      expect(screen.getByLabelText('some label')).toBeInTheDocument();
    });
  });

  describe('when hint is provided', () => {
    it('should render the hint text', () => {
      renderCardExpDateInput({ hint: 'hint' });
      expect(screen.getByText('hint')).toBeInTheDocument();
    });
  });

  describe('when it has an error', () => {
    it('should add an error border to the input', () => {
      renderCardExpDateInput({
        hasError: true,
        label: 'Expiration date',
      });
      const firstInput = screen.getByLabelText('Expiration date');
      expect(firstInput.getAttribute('data-has-error')).toEqual('true');
    });
  });

  describe('accepted data type', () => {
    const customLabel = 'Expiration date';
    it('should not accept non numeric values', () => {
      renderCardExpDateInput({ value: 'a', label: 'Expiration date' });
      expect(screen.getByLabelText(customLabel)).toHaveValue('');
    });

    it('should accept numeric values', () => {
      renderCardExpDateInput({ value: '1', label: customLabel });
      expect(screen.getByLabelText(customLabel)).toHaveValue('1');
    });

    it('should add a 0 to the month if the value is greater than 1', () => {
      renderCardExpDateInput({ value: '2', label: customLabel });
      expect(screen.getByLabelText(customLabel)).toHaveValue('02/');
    });

    it('should show an error if the date is not in the future', async () => {
      renderCardExpDateInput({
        value: '01/20',
        label: customLabel,
      });
      await userEvent.tab();
      await waitFor(() => {
        expect(screen.getByLabelText(customLabel)).toHaveStyle({
          borderColor: 'var(--fp-base-inputs-base-hint-error)',
        });
      });
    });
  });
});

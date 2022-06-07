import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';
import themes from 'themes';

import PinInput, { PinInputProps } from './pin-input';

describe('<PinInput />', () => {
  const renderPinInput = ({
    hasError = false,
    hintText,
    loading = false,
    loadingTestID = 'loading-test-id',
    onComplete = jest.fn(),
    testID = 'pin-input-test-id',
  }: Partial<PinInputProps>) =>
    customRender(
      <PinInput
        hasError={hasError}
        hintText={hintText}
        loading={loading}
        loadingTestID={loadingTestID}
        onComplete={onComplete}
        testID={testID}
      />,
    );

  it('should add a test id attribute', () => {
    renderPinInput({ testID: 'pin-input-test-id' });
    expect(screen.getByTestId('pin-input-test-id')).toBeInTheDocument();
  });

  it('should render the hint text', () => {
    renderPinInput({ hintText: 'hint' });
    expect(screen.getByText('hint')).toBeInTheDocument();
  });

  describe('when it has an error', () => {
    it('should add an error border to the input', () => {
      renderPinInput({
        hasError: true,
      });
      const firstInput = document.getElementsByTagName('input')[0];
      expect(firstInput).toHaveStyle({
        border: `1px solid ${themes.light.borderColor.error}`,
      });
    });

    it('should add an error border to the hint', () => {
      renderPinInput({
        hasError: true,
        hintText: 'Hint',
      });
      const hint = screen.getByText('Hint');
      expect(hint).toHaveStyle({
        color: themes.light.color.error,
      });
    });
  });

  describe('when typing', () => {
    it('should move the focus frontwards when the user press a number', async () => {
      renderPinInput({});
      const firstInput = document.getElementsByTagName('input')[0];
      firstInput.focus();
      await userEvent.keyboard('1');
      await userEvent.keyboard('{Backspace}');
      expect(firstInput.value).toEqual('');
    });

    it('should move the focus backwards when the user press on the Backspace', async () => {
      renderPinInput({});
      const firstInput = document.getElementsByTagName('input')[0];
      firstInput.focus();
      await userEvent.keyboard('1');
      await userEvent.keyboard('{Backspace}');
      expect(document.activeElement).toEqual(firstInput);
      expect(firstInput.value).toEqual('');
    });

    it('should trigger onComplete event once all fields are filled', async () => {
      const onCompleteMockFn = jest.fn();
      renderPinInput({ onComplete: onCompleteMockFn });
      const firstInput = document.getElementsByTagName('input')[0];
      firstInput.focus();
      await userEvent.keyboard('123456');
      expect(onCompleteMockFn).toHaveBeenCalledWith('123456');
    });

    describe('when the values are not numbers', () => {
      it('should now allow', async () => {
        renderPinInput({});
        const firstInput = document.getElementsByTagName('input')[0];
        firstInput.focus();
        await userEvent.keyboard('R');
        expect(firstInput.value).toEqual('');
      });

      it('should keep the current element focused', async () => {
        renderPinInput({});
        const firstInput = document.getElementsByTagName('input')[0];
        firstInput.focus();
        await userEvent.keyboard('R');
        expect(document.activeElement).toEqual(firstInput);
      });
    });
  });

  describe('when pasting the values', () => {
    it('should focus the next input field once you fill one input', async () => {
      const onCompleteMockFn = jest.fn();
      renderPinInput({ onComplete: onCompleteMockFn });
      const firstInput = document.getElementsByTagName('input')[0];
      const fourthInput = document.getElementsByTagName('input')[3];
      firstInput.focus();
      await userEvent.paste('123');
      expect(document.activeElement).toEqual(fourthInput);
    });

    it('should trigger onComplete event once all fields are filled', async () => {
      const onCompleteMockFn = jest.fn();
      renderPinInput({ onComplete: onCompleteMockFn });
      const firstInput = document.getElementsByTagName('input')[0];
      firstInput.focus();
      await userEvent.paste('123456');
      expect(onCompleteMockFn).toHaveBeenCalledWith('123456');
    });

    describe('when the values are not numbers', () => {
      it('should now allow', async () => {
        renderPinInput({});
        const firstInput = document.getElementsByTagName('input')[0];
        firstInput.focus();
        await userEvent.paste('123R');
        expect(firstInput.value).toEqual('');
      });

      it('should keep the current element focused', async () => {
        renderPinInput({});
        const firstInput = document.getElementsByTagName('input')[0];
        firstInput.focus();
        await userEvent.paste('123R');
        expect(document.activeElement).toEqual(firstInput);
      });
    });
  });

  describe('when is loading', () => {
    it('should show a spinner', () => {
      renderPinInput({ loading: true, loadingTestID: 'loading-test-id' });
      expect(screen.getByTestId('loading-test-id')).toBeInTheDocument();
    });
  });
});

import '../../config/initializers/i18next-test';

import themes from '@onefootprint/design-tokens';
import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import Toast from './toast';
import type { ToastProps } from './toast.types';

describe('<Toast />', () => {
  const renderToast = ({
    closeAriaLabel = 'Close',
    cta,
    description = 'description',
    id = '1',
    leaving = false,
    onClose = () => {},
    testID,
    title = 'title',
    variant,
  }: Partial<ToastProps>) =>
    customRender(
      <Toast
        closeAriaLabel={closeAriaLabel}
        cta={cta}
        description={description}
        id={id}
        leaving={leaving}
        onClose={onClose}
        testID={testID}
        title={title}
        variant={variant}
      />,
    );

  it('should assign a testID', () => {
    renderToast({ testID: 'toast-test-id' });

    expect(screen.getByTestId('toast-test-id')).toBeInTheDocument();
  });

  it('should assign the correct role', () => {
    renderToast({});

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render the title', () => {
    renderToast({ title: 'title' });

    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('should render the description', () => {
    renderToast({ description: 'description' });

    expect(screen.getByText('description')).toBeInTheDocument();
  });

  describe('when it has a cta', () => {
    it('should render the button', () => {
      renderToast({ cta: { label: 'Confirm' } });
      const cta = screen.getByRole('button', { name: 'Confirm' });

      expect(cta).toBeInTheDocument();
    });

    it('should trigger onClose', async () => {
      const onCloseMockFn = jest.fn();
      renderToast({
        closeAriaLabel: 'Close',
        onClose: onCloseMockFn,
        cta: { label: 'Confirm' },
      });
      const cta = screen.getByRole('button', { name: 'Confirm' });
      await userEvent.click(cta);

      expect(onCloseMockFn).toHaveBeenCalled();
    });

    it('should trigger onClick when clicking on the button', async () => {
      const onClickMockFn = jest.fn();
      renderToast({ cta: { label: 'Confirm', onClick: onClickMockFn } });
      const cta = screen.getByRole('button', { name: 'Confirm' });
      await userEvent.click(cta);

      expect(onClickMockFn).toHaveBeenCalled();
    });
  });

  describe('error variant', () => {
    it('should render the title with the correct styles', () => {
      renderToast({
        title: 'Title',
        variant: 'error',
      });
      const title = screen.getByText('Title');

      expect(title).toHaveStyle({
        color: themes.light.color.error,
      });
    });
  });

  describe('when clicking on the close button', () => {
    it('should trigger onClose', async () => {
      const onCloseMockFn = jest.fn();
      renderToast({ closeAriaLabel: 'Close', onClose: onCloseMockFn });
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await userEvent.click(closeButton);

      expect(onCloseMockFn).toHaveBeenCalled();
    });
  });
});

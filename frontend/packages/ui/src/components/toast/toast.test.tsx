import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';
import themes from 'themes';

import Toast from './toast';
import type { ToastProps } from './toast.types';

describe('<Toast />', () => {
  const renderToast = ({
    closeAriaLabel = 'Close',
    description = 'description',
    id = '1',
    leaving = false,
    onHide,
    testID,
    title = 'title',
    variant,
  }: Partial<ToastProps>) =>
    customRender(
      <Toast
        closeAriaLabel={closeAriaLabel}
        description={description}
        id={id}
        leaving={leaving}
        onHide={onHide}
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
    it('should trigger onHide', async () => {
      const onHideMockFn = jest.fn();
      renderToast({ closeAriaLabel: 'Close', onHide: onHideMockFn });
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await userEvent.click(closeButton);
      expect(onHideMockFn).toHaveBeenCalled();
    });
  });
});

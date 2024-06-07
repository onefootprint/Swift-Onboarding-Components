import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitForElementToBeRemoved } from '@onefootprint/test-utils';
import React, { useState } from 'react';

import Button from '../button';
import ToastProvider, { useToast } from './toast-provider';

const ToastConsumerDemo = () => {
  const [id, setId] = useState<null | string>(null);
  const { show, hide } = useToast();

  const handleOpenToast = () => {
    const nextId = show({ title: 'Title', description: 'Description ' });
    setId(nextId);
  };

  const handleHideToast = () => {
    if (id) {
      hide(id);
      setId(null);
    }
  };

  return (
    <>
      <Button onClick={handleOpenToast}>Open toast</Button>
      <Button onClick={handleHideToast}>Close toast</Button>
    </>
  );
};

describe('<ToastProvider />', () => {
  const renderToastProvider = () => {
    customRender(
      <ToastProvider>
        <ToastConsumerDemo />
      </ToastProvider>,
    );
  };

  it('should open and close the toast', async () => {
    renderToastProvider();
    const openButton = screen.getByRole('button', { name: 'Open toast' });
    await userEvent.click(openButton);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    const closeButton = screen.getByRole('button', { name: 'Close toast' });
    await userEvent.click(closeButton);
    await waitForElementToBeRemoved(() => screen.queryByRole('alert'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  describe('when the user clicks on the close button', () => {
    it('should close the toast', async () => {
      renderToastProvider();
      const openButton = screen.getByRole('button', { name: 'Open toast' });
      await userEvent.click(openButton);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await userEvent.click(closeButton);
      await waitForElementToBeRemoved(() => screen.queryByRole('alert'));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});

import React, { useState } from 'react';
import {
  customRender,
  screen,
  userEvent,
  waitForElementToBeRemoved,
} from 'test-utils';

import Button from '../button';
import ToastProvider, { useToast } from './toast-provider';

const ToastConsumerDemo = () => {
  const [id, setId] = useState<null | string>(null);
  const { open, close } = useToast();

  const handleOpenToast = () => {
    const nextId = open({ title: 'Title', description: 'Description ' });
    setId(nextId);
  };

  const handleCloseToast = () => {
    if (id) {
      close(id);
      setId(null);
    }
  };

  return (
    <>
      <Button onClick={handleOpenToast}>Open toast</Button>
      <Button onClick={handleCloseToast}>Close toast</Button>
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

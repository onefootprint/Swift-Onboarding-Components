import { createFileSaverSpy, customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import type { FieldOrPlaceholderProps } from './field-or-placeholder';
import FieldOrPlaceholder from './field-or-placeholder';

const fileSaverSpy = createFileSaverSpy();

describe('<FieldOrPlaceholder />', () => {
  const fileSaverMock = fileSaverSpy();

  const renderFieldOrPlaceholder = ({ data }: FieldOrPlaceholderProps) =>
    customRender(<FieldOrPlaceholder data={data} />);

  describe('when the data is undefined', () => {
    it('should render a placeholder', () => {
      renderFieldOrPlaceholder({ data: undefined });
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('when the data is null', () => {
    it('should render an encrypted data', () => {
      renderFieldOrPlaceholder({ data: null });
      expect(screen.getByText('••••••••••••')).toBeInTheDocument();
    });
  });

  describe('when the data is text', () => {
    it('should render the text', () => {
      renderFieldOrPlaceholder({ data: 'Jane Doe' });
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  describe('when the data is document', () => {
    it('should render a button to download', async () => {
      renderFieldOrPlaceholder({
        data: {
          name: 'lorem.pdf',
          content: new Blob(['lorem ipsum'], { type: 'application/pdf' }),
        },
      });
      const button = screen.getByText('Download');
      await userEvent.click(button);
      expect(fileSaverMock).toHaveBeenCalledWith(
        { content: ['lorem ipsum'], options: { type: 'application/pdf' } },
        'lorem.pdf',
      );
    });
  });
});

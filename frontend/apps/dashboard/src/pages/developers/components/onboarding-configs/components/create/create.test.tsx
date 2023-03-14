import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Create, { CreateProps } from './create';

describe('<CreateConfig />', () => {
  const defaultOptions = {
    open: true,
    onClose: jest.fn(),
    onCreate: jest.fn(),
  };

  const renderCreate = ({
    open = defaultOptions.open,
    onClose = defaultOptions.onClose,
    onCreate = defaultOptions.onCreate,
  }: Partial<CreateProps> = defaultOptions) => {
    customRender(<Create open={open} onClose={onClose} onCreate={onCreate} />);
  };

  describe.skip('When creating a KYB onboarding', () => {
    it('takes user through kyb', async () => {
      renderCreate();
      expect(screen.getByText('TypeForm')).toBeInTheDocument();
    });
  });
});

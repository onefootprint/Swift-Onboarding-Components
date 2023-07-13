import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';
import { withProxyConfigs } from 'src/pages/developers/components/proxy-configs/proxy-config.test.config';

import Form, { FormProps } from './form';

describe('<Form />', () => {
  beforeEach(() => {
    withProxyConfigs();
  });

  const renderForm = ({ onSubmit = jest.fn() }: Partial<FormProps>) =>
    customRender(<Form onSubmit={onSubmit} />);

  it('should render the read-only as checked by default', () => {
    renderForm({});

    const readonlyToggle = screen.getByRole('checkbox', { name: 'Read-only' });
    expect(readonlyToggle).toBeChecked();
  });

  describe('when clicking on the Decrypt data field', () => {
    it('should toggle the multi-select to pick the decrypt fields', async () => {
      renderForm({});

      const decryptField = screen.getByRole('checkbox', {
        name: 'Decrypt data',
      });
      await userEvent.click(decryptField);

      const attributesSelect = screen.getByLabelText('Permissible attributes');
      expect(attributesSelect).toBeInTheDocument();

      await userEvent.click(decryptField);
      expect(attributesSelect).not.toBeInTheDocument();
    });
  });

  describe('when clicking on the vault proxy field', () => {
    it('should toggle the multi-select to pick the proxy configs', async () => {
      renderForm({});

      const invokeProxyField = screen.getByRole('checkbox', {
        name: 'Invoke vault proxy',
      });
      await userEvent.click(invokeProxyField);

      const attributesSelect = screen.getByLabelText('Allowed proxy configs');
      expect(attributesSelect).toBeInTheDocument();

      await userEvent.click(invokeProxyField);
      expect(attributesSelect).not.toBeInTheDocument();
    });
  });
});

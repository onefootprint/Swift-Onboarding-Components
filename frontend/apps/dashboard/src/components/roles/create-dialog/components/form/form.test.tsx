import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { RoleKind } from '@onefootprint/types';
import { withProxyConfigs } from 'src/pages/proxy-configs/proxy-config.test.config';

import type { FormProps } from './form';
import Form from './form';

describe('<Form />', () => {
  beforeEach(() => {
    withProxyConfigs();
  });

  const renderForm = ({ onSubmit = jest.fn(), kind = RoleKind.dashboardUser }: Partial<FormProps>) =>
    customRender(<Form onSubmit={onSubmit} kind={kind} />);

  it('should render the read-only as checked by default', () => {
    renderForm({});

    const readonlyToggle = screen.getByRole('checkbox', { name: 'Read-only' });
    expect(readonlyToggle).toBeChecked();
  });

  describe.skip('when clicking on the Decrypt data field', () => {
    it('should toggle the multi-select to pick the decrypt fields', async () => {
      renderForm({});

      const decryptField = screen.getByRole('checkbox', {
        name: 'Decrypt data',
      });
      await userEvent.click(decryptField);

      const attributesSelect = screen.getByLabelText('Permissible attributes');
      expect(attributesSelect).toBeInTheDocument();

      await userEvent.click(decryptField);
      await waitFor(() => {
        expect(attributesSelect).not.toBeInTheDocument();
      });
    });
  });

  describe.skip('when clicking on the vault proxy field', () => {
    it('should toggle the multi-select to pick the proxy configs', async () => {
      renderForm({ kind: RoleKind.apiKey });

      const invokeProxyField = screen.getByRole('checkbox', {
        name: 'Invoke vault proxy',
      });
      await userEvent.click(invokeProxyField);

      const attributesSelect = screen.getByLabelText('Allowed proxy configs');
      expect(attributesSelect).toBeInTheDocument();

      await userEvent.click(invokeProxyField);
      await waitFor(() => {
        expect(attributesSelect).not.toBeInTheDocument();
      });
    });
  });
});

import { customRender, screen, waitFor } from '@onefootprint/test-utils';

import Create from './create';
import { filloutForm, withCreateProxyConfig, withCreateProxyConfigError } from './create.test.config';

describe('<Create />', () => {
  const renderCreate = () => customRender(<Create />);

  describe('when the request to create a proxy config succeeds', () => {
    beforeEach(() => {
      withCreateProxyConfig({
        name: 'My proxy config',
      });
    });

    it('should create a proxy config', async () => {
      renderCreate();
      await filloutForm();

      await waitFor(() => {
        const feedback = screen.getByText('Vault proxy configuration created');
        expect(feedback).toBeInTheDocument();
      });
    });
  });

  describe('when the request to create a proxy config fails', () => {
    beforeEach(() => {
      withCreateProxyConfigError();
    });

    it('should show an error message', async () => {
      renderCreate();
      await filloutForm();

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});

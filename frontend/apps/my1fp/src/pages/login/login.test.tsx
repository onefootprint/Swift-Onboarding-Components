import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import Login from './login';

describe('<Login />', () => {
  const renderLogin = () => customRender(<Login />);

  describe('when pressing on the button', () => {
    it('should open an iframe with the bifrost flow', async () => {
      renderLogin();
      const button = screen.getByRole('button', {
        name: 'Continue with Footprint',
      });
      await userEvent.click(button);
      const iframe = document.getElementsByTagName('iframe');
      expect(iframe).toBeTruthy();
    });

    it('should have a link with our terms', () => {
      renderLogin();
      const link = screen.getByRole('link', {
        name: 'Terms of Service',
      });
      expect(link).toHaveAttribute(
        'href',
        'https://www.onefootprint.com/terms-of-service',
      );
    });

    it('should have a link with our privacy policy', () => {
      renderLogin();
      const link = screen.getByRole('link', {
        name: 'Privacy Policy',
      });
      expect(link).toHaveAttribute(
        'href',
        'https://www.onefootprint.com/privacy-policy',
      );
    });
  });
});

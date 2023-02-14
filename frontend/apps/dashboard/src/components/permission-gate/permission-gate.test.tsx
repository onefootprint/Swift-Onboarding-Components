import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { RoleScope } from '@onefootprint/types';
import React from 'react';
import { asUserWithScope } from 'src/config/tests';

import PermissionGate from './permission-gate';

describe('<PermissionGate />', () => {
  describe('when the user has permission', () => {
    it('should just render the button', () => {
      asUserWithScope([RoleScope.admin]);
      customRender(
        <PermissionGate
          scope={RoleScope.apiKeys}
          fallbackText="You don't have permission"
        >
          <button type="button">Create</button>
        </PermissionGate>,
      );
      const button = screen.getByRole('button', { name: 'Create' });
      expect(button).not.toHaveAttribute('disabled');
    });
  });

  describe('when the user does not have permission', () => {
    it('should disable the button and show a tooltip', async () => {
      asUserWithScope([RoleScope.read]);
      customRender(
        <PermissionGate
          scope={RoleScope.apiKeys}
          fallbackText="You don't have permission"
        >
          <button type="button">Create</button>
        </PermissionGate>,
      );
      const button = screen.getByRole('button', { name: 'Create' });
      expect(button).toHaveAttribute('disabled');

      await userEvent.hover(button);
      expect(screen.getByText("You don't have permission")).toBeInTheDocument();
    });
  });
});

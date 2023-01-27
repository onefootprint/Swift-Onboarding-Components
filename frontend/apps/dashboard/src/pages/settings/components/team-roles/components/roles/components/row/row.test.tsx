import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Row, { RowProps } from './row';

describe('<Row />', () => {
  const renderRow = ({
    id = 'orgrole_jsuzOMB4Ag2D4yR7FBdCdy',
    name = 'Admin',
    scopes = ['admin'],
    isImmutable = true,
    createdAt = '11/17/22, 9:04 PM',
    numActiveUsers = 0,
  }: Partial<RowProps>) => {
    customRender(
      <table>
        <tbody>
          <tr>
            <Row
              createdAt={createdAt}
              id={id}
              isImmutable={isImmutable}
              name={name}
              numActiveUsers={numActiveUsers}
              scopes={scopes}
            />
          </tr>
        </tbody>
      </table>,
    );
  };

  it('should render the name', () => {
    renderRow({ name: 'Admin' });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  describe('when is admin', () => {
    it('should render "everything"', () => {
      renderRow({ scopes: ['admin'] });
      expect(screen.getByText('Everything')).toBeInTheDocument();
    });
  });

  describe('when is not admin', () => {
    it('should render the scopes', () => {
      renderRow({ scopes: ['read'] });
      expect(screen.getByText('Read-only')).toBeInTheDocument();
    });
  });
});

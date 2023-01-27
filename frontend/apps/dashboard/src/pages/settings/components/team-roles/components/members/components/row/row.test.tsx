import {
  createUseRouterSpy,
  customRender,
  screen,
} from '@onefootprint/test-utils';
import React from 'react';

import Row, { RowProps } from './row';
import memberFixture from './row.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Row />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/settings',
      query: {
        tab: 'members',
      },
    });
  });

  const renderRow = ({ member = memberFixture }: Partial<RowProps>) => {
    customRender(
      <table>
        <tbody>
          <tr>
            <Row member={member} />
          </tr>
        </tbody>
      </table>,
    );
  };

  it('should render the name', () => {
    renderRow({
      member: { ...memberFixture, firstName: 'Jane', lastName: 'Doe' },
    });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('should render the email', () => {
    renderRow({
      member: { ...memberFixture, email: 'jane.doe@acme.com' },
    });
    expect(screen.getByText('jane.doe@acme.com')).toBeInTheDocument();
  });

  it('should render the last active time', () => {
    renderRow({
      member: { ...memberFixture, lastLoginAt: '3 hours ago' },
    });
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
  });

  it('should render the role', () => {
    renderRow({
      member: { ...memberFixture, roleName: 'Admin' },
    });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  describe('when the name is not present', () => {
    it('should render a dash', () => {
      renderRow({
        member: { ...memberFixture, firstName: null, lastName: null },
      });
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('when invite is pending', () => {
    it('should render the pending invite badge', () => {
      renderRow({
        member: { ...memberFixture, lastLoginAt: null },
      });
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });
});

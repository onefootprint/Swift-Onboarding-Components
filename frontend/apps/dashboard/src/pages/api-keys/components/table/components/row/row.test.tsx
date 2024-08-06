import { createUseRouterSpy, customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { asAdminUser, resetUser } from 'src/config/tests';

import type { RowProps } from './row';
import Row from './row';
import { ApiKeyFixture, RolesFixture, withApiKeys, withRoles } from './row.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Row />', () => {
  beforeEach(() => {
    asAdminUser();
    withRoles();
    withApiKeys();
    useRouterSpy({
      pathname: '/developers',
      query: {
        tab: 'api-keys',
      },
    });
  });

  afterAll(() => {
    resetUser();
  });

  const renderRow = ({ apiKey = ApiKeyFixture }: Partial<RowProps>) => {
    customRender(
      <table>
        <tbody>
          <tr>
            <Row apiKey={apiKey} />
          </tr>
        </tbody>
      </table>,
    );
  };

  it('should render the role', () => {
    renderRow({
      apiKey: { ...ApiKeyFixture, role: { ...RolesFixture[0], name: 'Admin' } },
    });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should render both roles in fixture when clicking dropdown', async () => {
    renderRow({
      apiKey: { ...ApiKeyFixture, role: { ...RolesFixture[0], name: 'Admin' } },
    });

    const trigger = screen.getByLabelText('Edit role');
    await userEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Member')).toBeInTheDocument();
    });
  });

  it('should change role for API key when opening dropdown and clicking on a new one', async () => {
    renderRow({
      apiKey: { ...ApiKeyFixture, role: { ...RolesFixture[0], name: 'Admin' } },
    });

    const trigger = screen.getByLabelText('Edit role');
    await userEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Member')).toBeInTheDocument();
    });

    const member = screen.getByText('Member');
    await userEvent.click(member);

    await waitFor(() => {
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Member')).toBeInTheDocument();
  });
});

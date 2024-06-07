import { createUseRouterSpy, customRender, screen, waitFor } from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUserFirmEmployee, resetUser } from 'src/config/tests';

import Tenants from './tenants';
import { tenantsFixture, withTenants, withTenantsError } from './tenants.test.config';

const useRouterSpy = createUseRouterSpy();

const renderTenants = () => customRender(<Tenants />);

describe('<Tenants />', () => {
  beforeAll(() => {
    useRouterSpy({
      pathname: '/',
      query: {
        'super-admin': 'true',
      },
    });
    asAdminUserFirmEmployee();
  });

  afterAll(() => {
    resetUser();
  });

  describe('when the request to fetch the tenants fails', () => {
    beforeEach(() => {
      withTenantsError();
    });

    it('should show an error messsage', async () => {
      renderTenants();

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('when the request to fetch the tenants succeeds', () => {
    beforeEach(() => {
      withTenants();
    });

    it('should render tenant name, id', async () => {
      renderTenants();

      await waitFor(() => {
        tenantsFixture.data.forEach(tenant => {
          const name = screen.getByText(tenant.name);
          expect(name).toBeInTheDocument();
        });
      });
    });

    it('should render tenant id', async () => {
      renderTenants();

      await waitFor(() => {
        tenantsFixture.data.forEach(tenant => {
          const id = screen.getByText(tenant.id);
          expect(id).toBeInTheDocument();
        });
      });
    });

    it('should render the total of live users', async () => {
      renderTenants();

      await waitFor(() => {
        tenantsFixture.data.forEach(tenant => {
          const numLiveVaults = screen.getByText(tenant.numLiveVaults);
          expect(numLiveVaults).toBeInTheDocument();
        });
      });
    });

    it('should render the total of sandbox users', async () => {
      renderTenants();

      await waitFor(() => {
        tenantsFixture.data.forEach(tenant => {
          const numSandboxVaults = screen.getByText(tenant.numSandboxVaults);
          expect(numSandboxVaults).toBeInTheDocument();
        });
      });
    });
  });
});

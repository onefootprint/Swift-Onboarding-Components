import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import Details from './details';
import {
  entityFixture,
  getTextByRow,
  withEntity,
  withEntityError,
  withLiveness,
  withRiskSignals,
  withTimeline,
} from './details.test.config';

beforeEach(() => {
  asAdminUser();
});

afterAll(() => {
  resetUser();
});

const useRouterSpy = createUseRouterSpy();

describe('<Details />', () => {
  beforeEach(() => {
    asAdminUser();
    useRouterSpy({
      pathname: `/new-users/${entityFixture.id}`,
      query: {
        id: entityFixture.id,
      },
    });
    withRiskSignals();
    withTimeline();

    withLiveness();
  });

  afterAll(() => {
    resetUser();
  });

  const renderDetails = () => {
    customRender(<Details />);
  };

  const renderDetailsAndWaitData = async () => {
    renderDetails();

    await waitFor(() => {
      const content = screen.getByTestId('entity-content');
      expect(content).toBeInTheDocument();
    });

    await waitFor(() => {
      const decryptButton = screen.getByRole('button', {
        name: 'Decrypt data',
      });
      expect(decryptButton).toBeInTheDocument();
    });
  };

  describe('when the request to fetch the new-users succeeds', () => {
    beforeEach(() => {
      withEntity();
    });

    it('should show a breadcrumb, with an option to return to the list pages', async () => {
      await renderDetailsAndWaitData();

      const breadcrumb = screen.getByLabelText('User details breadcrumb');
      expect(breadcrumb).toBeInTheDocument();

      const listLink = screen.getByRole('link', { name: 'Users' });
      expect(listLink).toBeInTheDocument();
      expect(listLink.getAttribute('href')).toEqual('/new-users');
    });

    it('should show a header with the entity status, start and id', async () => {
      await renderDetailsAndWaitData();

      const header = screen.getByRole('banner', { name: 'User info' });
      expect(header).toBeInTheDocument();

      const status = within(header).getByText('Verified');
      expect(status).toBeInTheDocument();

      const start = within(header).getByText('3/29/23, 11:07 PM');
      expect(start).toBeInTheDocument();

      const id = within(header).getByText('fp_id_wL6XIWe26cRinucZrRK1yn');
      expect(id).toBeInTheDocument();
    });

    // TODO: Add vault data
    // https://linear.app/footprint/issue/FP-3505/add-user-vault-tests
    describe.skip('vault', () => {});

    describe('risk signals', () => {
      it('should show the results', async () => {
        await renderDetailsAndWaitData();

        const container = screen.getByRole('region', {
          name: 'Risk signals',
        });

        await waitFor(() => {
          const noResults = within(container).getByText(
            'No risk signals found',
          );
          expect(noResults).toBeInTheDocument();
        });
      });
    });

    describe('device insights', () => {
      it('should show the user agent', async () => {
        await renderDetailsAndWaitData();

        const container = screen.getByRole('region', {
          name: 'Device insights',
        });

        const agent = within(container).getByText(
          'Apple Macintosh, Mac OS 10.15.7',
        );

        expect(agent).toBeInTheDocument();
      });

      it('should show the ip address', async () => {
        await renderDetailsAndWaitData();

        const container = screen.getByRole('region', {
          name: 'Device insights',
        });
        const ip = getTextByRow({
          name: 'IP address',
          value: '73.222.157.30',
          container,
        });

        expect(ip).toBeInTheDocument();
      });

      it('should show the biometrics', async () => {
        await renderDetailsAndWaitData();

        const container = screen.getByRole('region', {
          name: 'Device insights',
        });
        const ip = getTextByRow({
          name: 'Biometrics',
          value: 'Verified',
          container,
        });

        expect(ip).toBeInTheDocument();
      });
      it('should show the region', async () => {
        await renderDetailsAndWaitData();

        const container = screen.getByRole('region', {
          name: 'Device insights',
        });
        const region = getTextByRow({
          name: 'Region',
          value: 'San Francisco, CA',
          container,
        });

        expect(region).toBeInTheDocument();
      });

      it('should show the country', async () => {
        await renderDetailsAndWaitData();

        const container = screen.getByRole('region', {
          name: 'Device insights',
        });
        const country = getTextByRow({
          name: 'Country',
          value: 'United States',
          container,
        });

        expect(country).toBeInTheDocument();
      });
    });
  });

  describe('when the request to fetch the entity fails', () => {
    beforeEach(() => {
      withEntityError();
    });

    it('should show an error message', async () => {
      renderDetails();

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });
});

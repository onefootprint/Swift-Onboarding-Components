import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import { IdDI } from '@onefootprint/types';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import Details from './details';
import {
  decryptFields,
  entityFixture,
  getTextByRow,
  withAnnotations,
  withDecrypt,
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
    withAnnotations();
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

  describe('when the request to fetch the users succeeds', () => {
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
    describe('vault', () => {
      describe('basic data section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();
          const container = screen.getByRole('group', {
            name: 'Basic data',
          });

          const firstName = getTextByRow({
            name: 'First name',
            value: '•••••••••',
            container,
          });
          expect(firstName).toBeInTheDocument();

          const lastName = getTextByRow({
            name: 'Last name',
            value: '•••••••••',
            container,
          });
          expect(lastName).toBeInTheDocument();

          const email = getTextByRow({
            name: 'Email',
            value: '•••••••••',
            container,
          });
          expect(email).toBeInTheDocument();

          const phoneNumber = getTextByRow({
            name: 'Phone number',
            value: '•••••••••',
            container,
          });
          expect(phoneNumber).toBeInTheDocument();
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              [IdDI.firstName]: 'Jane',
              [IdDI.lastName]: 'Doe',
              [IdDI.email]: 'jane.doe@acme.com',
              [IdDI.phoneNumber]: '12-3456789',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['First name', 'Email', 'Phone number']);
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            await waitFor(() => {
              const firstName = getTextByRow({
                name: 'First name',
                value: 'Jane',
                container,
              });
              expect(firstName).toBeInTheDocument();
            });

            await waitFor(() => {
              const lastName = getTextByRow({
                name: 'Last name',
                value: 'Doe',
                container,
              });
              expect(lastName).toBeInTheDocument();
            });

            await waitFor(() => {
              const email = getTextByRow({
                name: 'Email',
                value: 'jane.doe@acme.com',
                container,
              });
              expect(email).toBeInTheDocument();
            });

            await waitFor(() => {
              const phoneNumber = getTextByRow({
                name: 'Phone number',
                value: '12-3456789',
                container,
              });
              expect(phoneNumber).toBeInTheDocument();
            });
          });
        });
      });

      describe('address section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();
          const container = screen.getByRole('group', {
            name: 'Address data',
          });

          await waitFor(() => {
            const addressLine1 = getTextByRow({
              name: 'Address line 1',
              value: '•••••••••',
              container,
            });
            expect(addressLine1).toBeInTheDocument();
          });

          await waitFor(() => {
            const addressLine2 = getTextByRow({
              name: 'Address line 2',
              value: '-',
              container,
            });
            expect(addressLine2).toBeInTheDocument();
          });

          await waitFor(() => {
            const city = getTextByRow({
              name: 'City',
              value: '•••••••••',
              container,
            });
            expect(city).toBeInTheDocument();
          });

          await waitFor(() => {
            const zipCode = getTextByRow({
              name: 'Zip code',
              value: '•••••••••',
              container,
            });
            expect(zipCode).toBeInTheDocument();
          });

          await waitFor(() => {
            const state = getTextByRow({
              name: 'State',
              value: '•••••••••',
              container,
            });
            expect(state).toBeInTheDocument();
          });
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              [IdDI.country]: 'US',
              [IdDI.addressLine1]: '14 Linda Street',
              [IdDI.city]: 'West Haven',
              [IdDI.zip]: '06516',
              [IdDI.state]: 'CT',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields([
              'Country',
              'Address line 1',
              'City',
              'Zip code',
              'State',
            ]);

            const container = screen.getByRole('group', {
              name: 'Address data',
            });

            await waitFor(() => {
              const country = getTextByRow({
                name: 'Country',
                value: 'US',
                container,
              });
              expect(country).toBeInTheDocument();
            });

            await waitFor(() => {
              const addressLine1 = getTextByRow({
                name: 'Address line 1',
                value: '14 Linda Street',
                container,
              });
              expect(addressLine1).toBeInTheDocument();
            });

            await waitFor(() => {
              const city = getTextByRow({
                name: 'City',
                value: 'West Haven',
                container,
              });
              expect(city).toBeInTheDocument();
            });

            await waitFor(() => {
              const zipCode = getTextByRow({
                name: 'Zip code',
                value: '06516',
                container,
              });
              expect(zipCode).toBeInTheDocument();
            });

            await waitFor(() => {
              const state = getTextByRow({
                name: 'State',
                value: 'CT',
                container,
              });
              expect(state).toBeInTheDocument();
            });
          });
        });
      });

      describe('identity data section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();
          const container = screen.getByRole('group', {
            name: 'Identity data',
          });

          const ssn9 = getTextByRow({
            name: 'SSN (Full)',
            value: '•••••••••',
            container,
          });
          expect(ssn9).toBeInTheDocument();

          const ssn4 = getTextByRow({
            name: 'SSN (Last 4)',
            value: '•••••••••',
            container,
          });
          expect(ssn4).toBeInTheDocument();

          const dob = getTextByRow({
            name: 'Date of birth',
            value: '•••••••••',
            container,
          });
          expect(dob).toBeInTheDocument();
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              [IdDI.ssn4]: '6578',
              [IdDI.ssn9]: '123456578',
              [IdDI.dob]: '1967-09-29',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields([
              'SSN (Full)',
              'SSN (Last 4)',
              'Date of birth',
            ]);
            const container = screen.getByRole('group', {
              name: 'Identity data',
            });

            await waitFor(() => {
              const ssn9 = getTextByRow({
                name: 'SSN (Full)',
                value: '123456578',
                container,
              });
              expect(ssn9).toBeInTheDocument();
            });

            await waitFor(() => {
              const ssn4 = getTextByRow({
                name: 'SSN (Last 4)',
                value: '6578',
                container,
              });
              expect(ssn4).toBeInTheDocument();
            });

            await waitFor(() => {
              const dob = getTextByRow({
                name: 'Date of birth',
                value: '1967-09-29',
                container,
              });
              expect(dob).toBeInTheDocument();
            });
          });
        });
      });
    });

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

  describe('when the request to fetch the users fails', () => {
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

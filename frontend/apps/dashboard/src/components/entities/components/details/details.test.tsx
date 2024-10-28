import { customRender, screen, waitFor, within } from '@onefootprint/test-utils';
import { BusinessDI, EntityKind } from '@onefootprint/types';
import mockRouter from 'next-router-mock';
import { asAdminUser, resetUser } from 'src/config/tests';

import { HEADER_ACTIONS_ID } from '@/entity/constants';

import Details from './details';
import {
  decryptFields,
  entityFixture,
  getTextByRow,
  withAnnotations,
  withAuthEvents,
  withBusinessOwners,
  withEntity,
  withEntityDecrypt,
  withEntityError,
  withRiskSignals,
  withTimeline,
} from './details.test.config';

const ENCRYPTED_TEXT = '••••••••••••';

describe.skip('<Details />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl(`/entities/${entityFixture.id}`);
    mockRouter.query = {
      id: entityFixture.id,
    };

    asAdminUser();
    withRiskSignals();
    withTimeline();
    withBusinessOwners();
    withAuthEvents();
    withAnnotations();
  });

  afterAll(() => {
    resetUser();
  });

  const renderDetails = () => {
    customRender(
      <>
        <div id={HEADER_ACTIONS_ID} />
        <Details kind={EntityKind.business} listPath="/entities" />
      </>,
    );
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

  describe('when the request to fetch the entities succeeds', () => {
    beforeEach(() => {
      withEntity();
    });

    it('should show a breadcrumb, with an option to return to the list pages', async () => {
      await renderDetailsAndWaitData();

      const breadcrumb = screen.getByLabelText('Business details breadcrumb');
      expect(breadcrumb).toBeInTheDocument();

      const listLink = screen.getByRole('link', { name: 'Businesses' });
      expect(listLink).toBeInTheDocument();
      expect(listLink.getAttribute('href')).toEqual('/entities');
    });

    it('should show a header with the entity status, start and id', async () => {
      await renderDetailsAndWaitData();

      const header = screen.getByRole('banner', { name: 'Business info' });
      expect(header).toBeInTheDocument();

      const status = within(header).getByText('Verified');
      expect(status).toBeInTheDocument();

      const start = within(header).getByText('3/27/23, 2:43 PM');
      expect(start).toBeInTheDocument();

      const id = within(header).getByText('fp_bid_VXND11zUVRYQKKUxbUN3KD');
      expect(id).toBeInTheDocument();
    });

    describe('vault', () => {
      describe('basic data section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();

          const container = screen.getByRole('group', {
            name: 'Basic data',
          });

          const name = getTextByRow({
            name: 'Name',
            value: ENCRYPTED_TEXT,
            container,
          });
          expect(name).toBeInTheDocument();

          const dba = getTextByRow({
            name: 'Doing Business As',
            value: ENCRYPTED_TEXT,
            container,
          });
          expect(dba).toBeInTheDocument();

          const tin = getTextByRow({
            name: 'Taxpayer Identification Number (TIN)',
            value: ENCRYPTED_TEXT,
            container,
          });
          expect(tin).toBeInTheDocument();
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withEntityDecrypt(entityFixture.id, {
              [BusinessDI.name]: 'Acme Inc.',
              [BusinessDI.doingBusinessAs]: 'Acme',
              [BusinessDI.tin]: '12-3456789',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['Name', 'Doing Business As']);
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            await waitFor(() => {
              const name = getTextByRow({
                name: 'Name',
                value: 'Acme Inc.',
                container,
              });
              expect(name).toBeInTheDocument();
            });

            await waitFor(() => {
              const dba = getTextByRow({
                name: 'Doing Business As',
                value: 'Acme',
                container,
              });
              expect(dba).toBeInTheDocument();
            });
          });
        });
      });

      describe('address section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();

          const container = screen.getByRole('group', {
            name: 'Registered business address',
          });

          await waitFor(() => {
            const addressLine1 = getTextByRow({
              name: 'Address line 1',
              value: ENCRYPTED_TEXT,
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
              value: ENCRYPTED_TEXT,
              container,
            });
            expect(city).toBeInTheDocument();
          });

          await waitFor(() => {
            const zipCode = getTextByRow({
              name: 'Zip code',
              value: ENCRYPTED_TEXT,
              container,
            });
            expect(zipCode).toBeInTheDocument();
          });

          await waitFor(() => {
            const state = getTextByRow({
              name: 'State',
              value: ENCRYPTED_TEXT,
              container,
            });
            expect(state).toBeInTheDocument();
          });
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withEntityDecrypt(entityFixture.id, {
              [BusinessDI.country]: 'US',
              [BusinessDI.addressLine1]: '14 Linda Street',
              [BusinessDI.city]: 'West Haven',
              [BusinessDI.zip]: '06516',
              [BusinessDI.state]: 'CT',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['Country', 'Address line 1', 'City', 'Zip code', 'State']);

            const container = screen.getByRole('group', {
              name: 'Registered business address',
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

      describe('BOs section', () => {
        it('should display the stake of each beneficial owner', async () => {
          await renderDetailsAndWaitData();
          await waitFor(() => {
            screen.getByTestId('business-owners-content');
          });
          const container = screen.getByRole('group', {
            name: 'Beneficial owners',
          });

          await waitFor(() => {
            const primary = within(container).getByText(
              'Owns 50% of the business & submitted the business information',
            );
            expect(primary).toBeInTheDocument();
          });

          await waitFor(() => {
            const secondary = within(container).getByText('Owns 50% of the business');
            expect(secondary).toBeInTheDocument();
          });
        });

        it('should display a status and a link to check a beneficial owner', async () => {
          await renderDetailsAndWaitData();
          await waitFor(() => {
            screen.getByTestId('business-owners-content');
          });

          const container = screen.getByRole('group', {
            name: 'Beneficial owners',
          });

          await waitFor(() => {
            const status = within(container).getByText('Verified');
            expect(status).toBeInTheDocument();
          });

          await waitFor(() => {
            const link = within(container).getByText('View profile');
            expect(link).toBeInTheDocument();
          });

          await waitFor(() => {
            const link = within(container).getByRole('link', {
              name: 'View profile',
            }) as HTMLAnchorElement;
            const url = link.href.endsWith('/users/fp_id_XW3pNYPpV4Niup1PgFZBg6');
            expect(url).toBeTruthy();
          });
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withEntityDecrypt(entityFixture.id, {
              [BusinessDI.beneficialOwners]:
                '[{"first_name":"Jack","last_name":"Johnson","ownership_stake":50},{"first_name":"Billy","last_name":"Jackson","email":"billy@onefootprint.com","ownership_stake":50}]',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await waitFor(() => {
              screen.getByTestId('business-owners-content');
            });
            await decryptFields(['Beneficial owner']);

            const container = screen.getByRole('group', {
              name: 'Beneficial owners',
            });

            await waitFor(() => {
              const primary = within(container).getByText('Jack Johnson');
              expect(primary).toBeInTheDocument();
            });

            await waitFor(() => {
              const secondary = within(container).getByText('Billy Jackson');
              expect(secondary).toBeInTheDocument();
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
          const noResults = within(container).getByText('No risk signals found');
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

        const agent = within(container).getByText('Apple Macintosh, Mac OS 10.15.7');

        expect(agent).toBeInTheDocument();
      });

      it('should show the ip address', async () => {
        await renderDetailsAndWaitData();

        const container = screen.getByRole('region', {
          name: 'Device insights',
        });
        const ip = getTextByRow({
          name: 'IP address',
          value: '67.243.21.56',
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
          value: 'New York, NY',
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

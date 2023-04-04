import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import { BusinessDI } from '@onefootprint/types';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import { HEADER_ACTIONS_ID } from '@/business/constants';

import Details from './details';
import {
  decryptFields,
  entityFixture,
  getTextByRow,
  withEntity,
  withEntityDecrypt,
  withEntityError,
  withRiskSignals,
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
      pathname: `/businesses/${entityFixture.id}`,
      query: {
        id: entityFixture.id,
      },
    });
  });

  afterAll(() => {
    resetUser();
  });

  const renderDetails = () => {
    customRender(
      <>
        <div id={HEADER_ACTIONS_ID} />
        <Details />
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
      withRiskSignals();
    });

    it('should show a breadcrumb, with an option to return to the list pages', async () => {
      await renderDetailsAndWaitData();

      const breadcrumb = screen.getByLabelText('Business details breadcrumb');
      expect(breadcrumb).toBeInTheDocument();

      const listLink = screen.getByRole('link', { name: 'Businesses' });
      expect(listLink).toBeInTheDocument();
      expect(listLink.getAttribute('href')).toEqual('/businesses');
    });

    it('should show a header with the entity status, start and id', async () => {
      await renderDetailsAndWaitData();

      const header = screen.getByRole('banner', { name: 'Business info' });
      expect(header).toBeInTheDocument();

      const status = screen.getByText('Verified');
      expect(status).toBeInTheDocument();

      const start = screen.getByText('3/27/23, 2:43 PM');
      expect(start).toBeInTheDocument();

      const id = screen.getByText('fp_bid_VXND11zUVRYQKKUxbUN3KD');
      expect(id).toBeInTheDocument();
    });

    describe('vault', () => {
      describe('basic data section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();

          const name = getTextByRow('Name', '•••••••••');
          expect(name).toBeInTheDocument();

          const ein = getTextByRow(
            'Taxpayer Identification Number (TIN)',
            '•••••••••',
          );
          expect(ein).toBeInTheDocument();
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withEntityDecrypt(entityFixture.id, {
              [BusinessDI.name]: 'Acme Inc.',
              [BusinessDI.tin]: '12-3456789',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['Name']);

            await waitFor(() => {
              const name = getTextByRow('Name', 'Acme Inc.');
              expect(name).toBeInTheDocument();
            });
          });
        });
      });

      describe('address section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();

          const country = getTextByRow('Country', '•••••••••');
          expect(country).toBeInTheDocument();

          const addressLine1 = getTextByRow('Address line 1', '•••••••••');
          expect(addressLine1).toBeInTheDocument();

          const addressLine2 = getTextByRow('Address line 2', '-');
          expect(addressLine2).toBeInTheDocument();

          const city = getTextByRow('City', '•••••••••');
          expect(city).toBeInTheDocument();

          const zipCode = getTextByRow('Zip code', '•••••••••');
          expect(zipCode).toBeInTheDocument();

          const state = getTextByRow('State', '•••••••••');
          expect(state).toBeInTheDocument();
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
            await decryptFields([
              'Country',
              'Address line 1',
              'City',
              'Zip code',
              'State',
            ]);

            await waitFor(() => {
              const country = getTextByRow('Country', 'US');
              expect(country).toBeInTheDocument();
            });

            await waitFor(() => {
              const addressLine1 = getTextByRow(
                'Address line 1',
                '14 Linda Street',
              );
              expect(addressLine1).toBeInTheDocument();
            });

            await waitFor(() => {
              const city = getTextByRow('City', 'West Haven');
              expect(city).toBeInTheDocument();
            });

            await waitFor(() => {
              const zip = getTextByRow('Zip code', '06516');
              expect(zip).toBeInTheDocument();
            });

            await waitFor(() => {
              const state = getTextByRow('State', 'CT');
              expect(state).toBeInTheDocument();
            });
          });
        });
      });

      describe('BOs section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();

          const bo = getTextByRow('Beneficial owner', '-');
          expect(bo).toBeInTheDocument();
        });

        describe('when clicking on the decrypt button', () => {
          it('should allow to decrypt the data', async () => {});
        });
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

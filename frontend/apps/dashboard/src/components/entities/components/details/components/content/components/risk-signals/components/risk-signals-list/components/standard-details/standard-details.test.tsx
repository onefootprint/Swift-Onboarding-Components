import { customRender, screen, userEvent, waitFor, waitForElementToBeRemoved, within } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';

import StandardDetails from './standard-details';
import {
  amlDetailFixture,
  entityIdFixture,
  riskSignalDetailFixture,
  riskSignalDetailWithAmlFixture,
  withData,
  withDecryptRiskSignalAmlHits,
  withEntity,
  withRiskSignalDetails,
  withRiskSignalDetailsError,
} from './standard-details.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<StandardDetails />', () => {
  const renderRiskSignalStandardDetails = () => {
    customRender(<StandardDetails />);
  };

  const renderRiskSignalStandardDetailsAndWaitData = async () => {
    renderRiskSignalStandardDetails();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('progressbar', {
        name: 'Loading details...',
      }),
    );
  };

  describe('fetching and content logic', () => {
    beforeEach(() => {
      mockRouter.setCurrentUrl('/users/details');
      mockRouter.query = {
        risk_signal_id: riskSignalDetailFixture.id,
        id: entityIdFixture,
      };

      withData();
      withEntity();
    });

    describe('when the request fails', () => {
      it('should show an error message within the drawer', async () => {
        withRiskSignalDetailsError();
        renderRiskSignalStandardDetails();

        const loader = await screen.findByRole('progressbar', {
          name: 'Loading details...',
        });
        expect(loader).toBeInTheDocument();

        await waitForElementToBeRemoved(() =>
          screen.queryByRole('progressbar', {
            name: 'Loading details...',
          }),
        );

        const error = screen.getByText('Something went wrong');
        expect(error).toBeInTheDocument();
      });
    });

    describe('when the request succeeds', () => {
      describe('when there are no AML hits', () => {
        it('should show a loading and then the overview data', async () => {
          withRiskSignalDetails();
          renderRiskSignalStandardDetails();

          const loader = await screen.findByRole('progressbar', {
            name: 'Loading details...',
          });
          expect(loader).toBeInTheDocument();

          await waitForElementToBeRemoved(() =>
            screen.queryByRole('progressbar', {
              name: 'Loading details...',
            }),
          );

          const note = screen.queryByText('VOIP phone number');
          expect(note).not.toBeInTheDocument();

          const description = screen.getByText(
            "The consumer's phone number could be tied to an answering service, page, or VoIP.",
          );
          expect(description).toBeInTheDocument();

          const scopes = screen.getAllByText('Phone number and date of birth');
          expect(scopes.length).toBe(2); // Dialog title and the scope text

          const amlDecryptTitle = screen.queryByText('Protected details');
          expect(amlDecryptTitle).not.toBeInTheDocument();
        });
      });

      describe('when there are AML hits', () => {
        beforeEach(() => {
          withRiskSignalDetails(riskSignalDetailWithAmlFixture);
        });

        it('should initially be encrypted', async () => {
          await renderRiskSignalStandardDetailsAndWaitData();

          const decryptTitle = await screen.findByText('Protected details');
          expect(decryptTitle).toBeInTheDocument();

          const decryptButton = await screen.findByRole('button', {
            name: 'Decrypt',
          });
          expect(decryptButton).toBeInTheDocument();
        });

        it('should show the aml hits data after decryption', async () => {
          withDecryptRiskSignalAmlHits();
          await renderRiskSignalStandardDetailsAndWaitData();

          const decryptButton = await screen.findByRole('button', {
            name: 'Decrypt',
          });
          expect(decryptButton).toBeInTheDocument();
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Decrypt',
            }),
          );

          const sourceUrlValue = await screen.findByText(`${amlDetailFixture.shareUrl}`);
          expect(sourceUrlValue).toBeInTheDocument();

          // Show Name, Match types, first 6 fields, Show all, and Relevant media
          const nameRow = await screen.findByRole('group', {
            name: 'name',
          });
          expect(within(nameRow).getByText('John Smith')).toBeInTheDocument();

          const matchTypesRow = await screen.findByRole('group', {
            name: 'matchTypes',
          });
          expect(within(matchTypesRow).getByText('Name exact')).toBeInTheDocument();

          const showAllRow = await screen.findByRole('group', {
            name: 'showAll',
          });
          expect(within(showAllRow).getByText('2 more data matches')).toBeInTheDocument();

          const relevantMediaRow = await screen.findByRole('group', {
            name: 'relevantMedia',
          });
          expect(within(relevantMediaRow).getByText('Relevant media')).toBeInTheDocument();

          const genderRow = screen.queryByRole('group', {
            name: 'gender',
          });
          expect(genderRow).not.toBeInTheDocument();
        });

        it('should reveal all fields after clicking Show all', async () => {
          withDecryptRiskSignalAmlHits();
          await renderRiskSignalStandardDetailsAndWaitData();

          const decryptButton = await screen.findByRole('button', {
            name: 'Decrypt',
          });
          expect(decryptButton).toBeInTheDocument();
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Decrypt',
            }),
          );

          const showAllButton = await screen.findByText('Show all');
          expect(showAllButton).toBeInTheDocument();
          await userEvent.click(screen.getByText('Show all'));

          const genderRow = await screen.findByRole('group', {
            name: 'gender',
          });
          expect(within(genderRow).getByText('Male')).toBeInTheDocument();

          const locationurlRow = await screen.findByRole('group', {
            name: 'locationurl',
          });
          expect(within(locationurlRow).getByText('https://locationurl.com')).toBeInTheDocument();
        });

        it('should show aml media data after clicking See more', async () => {
          withDecryptRiskSignalAmlHits();
          await renderRiskSignalStandardDetailsAndWaitData();

          await waitFor(() => {
            const decryptButton = screen.getByRole('button', {
              name: 'Decrypt',
            });
            expect(decryptButton).toBeInTheDocument();
          });
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Decrypt',
            }),
          );

          await waitFor(() => {
            const seeMoreButton = screen.getByText('See more');
            expect(seeMoreButton).toBeInTheDocument();
          });
          await userEvent.click(screen.getByText('See more'));

          await waitFor(() => {
            const drawerTitle = screen.getByText('Relevant media', {
              exact: false,
            });
            expect(drawerTitle).toBeInTheDocument();
          });

          await waitFor(() => {
            const mediaItems = screen.getAllByRole('group');
            expect(mediaItems).toHaveLength(2);
          });

          await waitFor(() => {
            const mediaDate = screen.getByText('12 Nov. 2023');
            expect(mediaDate).toBeInTheDocument();
          });
          await waitFor(() => {
            const mediaTitle = screen.getByText('Sample title 1');
            expect(mediaTitle).toBeInTheDocument();
          });
          await waitFor(() => {
            const mediaSnippet = screen.getByText('Sample snippet 1');
            expect(mediaSnippet).toBeInTheDocument();
          });
          await waitFor(() => {
            const mediaTitle = screen.getByText('Sample title 2');
            expect(mediaTitle).toBeInTheDocument();
          });
          await waitFor(() => {
            const mediaSnippet = screen.getByText('Sample snippet 2');
            expect(mediaSnippet).toBeInTheDocument();
          });
        });
      });
    });
  });

  describe('isOpen logic', () => {
    it('should not open when is_sentilink is in the query params', async () => {
      mockRouter.query = {
        risk_signal_id: riskSignalDetailFixture.id,
        id: entityIdFixture,
        is_sentilink: 'true',
      };

      renderRiskSignalStandardDetails();

      await waitFor(() => {
        const drawer = screen.queryByRole('dialog');
        expect(drawer).not.toBeInTheDocument();
      });
    });

    it('should not open when risk_signal_id is missing from the query params', async () => {
      mockRouter.query = {
        id: entityIdFixture,
      };

      renderRiskSignalStandardDetails();

      await waitFor(() => {
        const drawer = screen.queryByRole('dialog');
        expect(drawer).not.toBeInTheDocument();
      });
    });

    it('should open the drawer when risk_signal_id and id are in the query params', async () => {
      mockRouter.query = {
        risk_signal_id: riskSignalDetailFixture.id,
        id: entityIdFixture,
      };

      renderRiskSignalStandardDetails();

      const drawer = await screen.findByRole('dialog');
      expect(drawer).toBeInTheDocument();
    });
  });
});

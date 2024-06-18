import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import RiskSignalDetails from './details';
import {
  amlDetailFixture,
  entityIdFixture,
  riskSignalDetailsFixture,
  riskSignalDetailsWithAmlFixture,
  withData,
  withDecryptRiskSignalAmlHits,
  withEntity,
  withRiskSignalDetails,
  withRiskSignalDetailsError,
} from './details.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Details />', () => {
  beforeEach(() => {
    withData();
    useRouterSpy({
      pathname: `/users/detail`,
      query: {
        risk_signal_id: riskSignalDetailsFixture.id,
        id: entityIdFixture,
      },
    });
  });

  const renderRiskSignalDetails = () => {
    customRender(<RiskSignalDetails />);
  };

  const renderRiskSignalDetailsAndWaitData = async () => {
    renderRiskSignalDetails();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('progressbar', {
        name: 'Loading details...',
      }),
    );
  };

  describe('when the request fails', () => {
    it('should show an error message within the drawer', async () => {
      withRiskSignalDetailsError();
      renderRiskSignalDetails();

      await waitFor(() => {
        const loader = screen.getByRole('progressbar', {
          name: 'Loading details...',
        });
        expect(loader).toBeInTheDocument();
      });

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
        renderRiskSignalDetails();

        await waitFor(() => {
          const loader = screen.getByRole('progressbar', {
            name: 'Loading details...',
          });
          expect(loader).toBeInTheDocument();
        });

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

        const scopes = screen.getByText('Phone number and date of birth');
        expect(scopes).toBeInTheDocument();

        const amlDecryptTitle = screen.queryByText('Protected details');
        expect(amlDecryptTitle).not.toBeInTheDocument();
      });
    });

    describe('when there are AML hits', () => {
      beforeEach(() => {
        withRiskSignalDetails(riskSignalDetailsWithAmlFixture);
        withEntity();
      });

      it('should initially be encrypted', async () => {
        await renderRiskSignalDetailsAndWaitData();

        await waitFor(() => {
          const decryptTitle = screen.getByText('Protected details');
          expect(decryptTitle).toBeInTheDocument();
        });
        await waitFor(() => {
          const decryptButton = screen.getByRole('button', {
            name: 'Decrypt',
          });
          expect(decryptButton).toBeInTheDocument();
        });
      });

      it('should show the aml hits data after decryption', async () => {
        withDecryptRiskSignalAmlHits();
        await renderRiskSignalDetailsAndWaitData();

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
          const sourceUrlValue = screen.getByText(`${amlDetailFixture.shareUrl}`);
          expect(sourceUrlValue).toBeInTheDocument();
        });

        // Show Name, Match types, first 6 fields, Show all, and Relevant media
        await waitFor(() => {
          const nameRow = screen.getByRole('group', {
            name: 'name',
          });
          expect(within(nameRow).getByText('John Smith')).toBeInTheDocument();
        });

        await waitFor(() => {
          const matchTypesRow = screen.getByRole('group', {
            name: 'matchTypes',
          });
          expect(within(matchTypesRow).getByText('Name exact')).toBeInTheDocument();
        });

        await waitFor(() => {
          const showAllRow = screen.getByRole('group', {
            name: 'showAll',
          });
          expect(within(showAllRow).getByText('2 more data matches')).toBeInTheDocument();
        });

        await waitFor(() => {
          const relevantMediaRow = screen.getByRole('group', {
            name: 'relevantMedia',
          });
          expect(within(relevantMediaRow).getByText('Relevant media')).toBeInTheDocument();
        });

        await waitFor(() => {
          const genderRow = screen.queryByRole('group', {
            name: 'gender',
          });
          expect(genderRow).not.toBeInTheDocument();
        });
      });

      it('should reveal all fields after clicking Show all', async () => {
        withDecryptRiskSignalAmlHits();
        await renderRiskSignalDetailsAndWaitData();

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
          const showAllButton = screen.getByText('Show all');
          expect(showAllButton).toBeInTheDocument();
        });
        await userEvent.click(screen.getByText('Show all'));

        await waitFor(() => {
          const genderRow = screen.getByRole('group', {
            name: 'gender',
          });
          expect(within(genderRow).getByText('Male')).toBeInTheDocument();
        });

        await waitFor(() => {
          const locationurlRow = screen.getByRole('group', {
            name: 'locationurl',
          });
          expect(within(locationurlRow).getByText('https://locationurl.com')).toBeInTheDocument();
        });
      });

      it('should show aml media data after clicking See more', async () => {
        withDecryptRiskSignalAmlHits();
        await renderRiskSignalDetailsAndWaitData();

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
          const drawerTitle = screen.getByText('Relevant media • ', {
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

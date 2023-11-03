import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import BusinessProfile from './business-profile';
import {
  withOrganization,
  withOrganizationError,
  withUpdateOrg,
  withUpdateOrgError,
} from './business-profile.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<BusinessProfile />', () => {
  beforeEach(() => {
    asAdminUser();
    useRouterSpy({
      pathname: '/settings',
    });
  });

  afterAll(() => {
    resetUser();
  });

  const renderBusinessProfile = () => {
    customRender(<BusinessProfile />);
  };

  const renderBusinessProfileAndWaitData = async () => {
    customRender(<BusinessProfile />);
    await waitFor(() => {
      const data = screen.getByTestId('business-profile-data');
      expect(data).toBeInTheDocument();
    });
  };

  describe('when the request fails', () => {
    beforeAll(() => {
      withOrganizationError();
    });

    it('should show a spinner and then an error message', async () => {
      renderBusinessProfile();

      await waitFor(() => {
        const loading = screen.getByTestId('business-profile-loading');
        expect(loading).toBeInTheDocument();
      });

      await waitFor(() => {
        const error = screen.getByText('Something went wrong');
        expect(error).toBeInTheDocument();
      });
    });
  });

  describe('when the request succeeds', () => {
    beforeAll(() => {
      withOrganization();
    });

    it('should show the org name, id, logo and website', async () => {
      await renderBusinessProfileAndWaitData();

      await waitFor(() => {
        const name = screen.getByText('Acme');
        expect(name).toBeInTheDocument();
      });

      await waitFor(() => {
        const website = screen.getByText('https://acme.com');
        expect(website).toBeInTheDocument();
      });

      await waitFor(() => {
        const website = screen.getByText('https://acme.com');
        expect(website).toBeInTheDocument();
      });

      await waitFor(() => {
        const id = screen.getByText('org_9L42CAdpXhDeSmi1DI8Qks');
        expect(id).toBeInTheDocument();
      });

      await waitFor(() => {
        const logo = screen.getByRole('img', { name: 'Acme' });
        expect(logo).toHaveAttribute('src', 'https://acme.com/logo.png');
      });
    });

    describe('when updating the company name', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          withUpdateOrg({ name: 'Lorem' });
        });

        it('should update the company name', async () => {
          await renderBusinessProfileAndWaitData();

          const prevName = screen.getByText('Acme');
          expect(prevName).toBeInTheDocument();

          const editDialogTrigger = screen.getByRole('button', {
            name: 'Edit Company name',
          });
          await userEvent.click(editDialogTrigger);

          const editDialog = screen.getByRole('dialog', {
            name: 'Edit Company name',
          });
          expect(editDialog).toBeInTheDocument();

          const input = screen.getByLabelText('Company name');
          await userEvent.type(input, 'Lorem');

          const submit = screen.getByRole('button', { name: 'Save' });
          await userEvent.click(submit);

          await waitForElementToBeRemoved(() =>
            screen.queryByRole('dialog', {
              name: 'Edit Company name',
            }),
          );

          await waitFor(() => {
            const newName = screen.getByText('Lorem');
            expect(newName).toBeInTheDocument();
          });
        });
      });

      describe('when the request fails', () => {
        beforeEach(() => {
          withUpdateOrgError();
        });

        it('should update the company name', async () => {
          await renderBusinessProfileAndWaitData();

          const prevName = screen.getByText('Acme');
          expect(prevName).toBeInTheDocument();

          const editDialogTrigger = screen.getByRole('button', {
            name: 'Edit Company name',
          });
          await userEvent.click(editDialogTrigger);

          const editDialog = screen.getByRole('dialog', {
            name: 'Edit Company name',
          });
          expect(editDialog).toBeInTheDocument();

          const input = screen.getByLabelText('Company name');
          await userEvent.type(input, 'Lorem');

          const submit = screen.getByRole('button', { name: 'Save' });
          await userEvent.click(submit);

          await waitFor(() => {
            const error = screen.getByText('Something went wrong');
            expect(error).toBeInTheDocument();
          });
        });
      });
    });

    describe('when updating the website url', () => {
      beforeEach(() => {
        withOrganization();
      });

      describe('when the request succeeds', () => {
        beforeEach(() => {
          withUpdateOrg({ websiteUrl: 'https://acme.com.br' });
        });

        it('should update the website url', async () => {
          await renderBusinessProfileAndWaitData();

          const prevWebsite = screen.getByText('https://acme.com');
          expect(prevWebsite).toBeInTheDocument();

          const editDialogTrigger = screen.getByRole('button', {
            name: 'Edit Website',
          });
          await userEvent.click(editDialogTrigger);

          const editDialog = screen.getByRole('dialog', {
            name: 'Edit Website',
          });
          expect(editDialog).toBeInTheDocument();

          const input = screen.getByLabelText('Website');
          await userEvent.type(input, '.br');

          const submit = screen.getByRole('button', { name: 'Save' });
          await userEvent.click(submit);

          await waitForElementToBeRemoved(() =>
            screen.queryByRole('dialog', {
              name: 'Edit Website',
            }),
          );

          await waitFor(() => {
            const newName = screen.getByText('https://acme.com.br');
            expect(newName).toBeInTheDocument();
          });
        });
      });

      describe('when the request fails', () => {
        beforeEach(() => {
          withUpdateOrgError();
        });

        it('should update the website url', async () => {
          await renderBusinessProfileAndWaitData();

          const prevWebsite = screen.getByText('https://acme.com');
          expect(prevWebsite).toBeInTheDocument();

          const editDialogTrigger = screen.getByRole('button', {
            name: 'Edit Website',
          });
          await userEvent.click(editDialogTrigger);

          const editDialog = screen.getByRole('dialog', {
            name: 'Edit Website',
          });
          expect(editDialog).toBeInTheDocument();

          const input = screen.getByLabelText('Website');
          await userEvent.type(input, '.br');

          const submit = screen.getByRole('button', { name: 'Save' });
          await userEvent.click(submit);

          await waitFor(() => {
            const error = screen.getByText('Something went wrong');
            expect(error).toBeInTheDocument();
          });
        });
      });
    });
  });
});

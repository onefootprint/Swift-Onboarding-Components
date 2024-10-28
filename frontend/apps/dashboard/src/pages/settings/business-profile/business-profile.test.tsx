import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import { asAdminUser, asUserWithScope } from 'src/config/tests';

import BusinessProfile from './business-profile';
import {
  organizationDataLabels,
  organizationFixture,
  updatedOrgData,
  withOrganization,
  withOrganizationError,
  withUpdateOrg,
  withUpdateOrgError,
} from './business-profile.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<BusinessProfile />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/settings/business-profile');
  });

  beforeEach(() => {
    asAdminUser();
  });

  const renderBusinessProfile = () => {
    customRender(<BusinessProfile />);
  };

  const renderBusinessProfileAndWaitData = async () => {
    customRender(<BusinessProfile />);
    await Promise.all(
      organizationDataLabels.map(label =>
        waitFor(() => {
          const data = screen.getByText(label);
          expect(data).toBeInTheDocument();
        }),
      ),
    );
  };

  describe('when the request fails', () => {
    beforeAll(() => {
      withOrganizationError();
    });

    it('should show a spinner and then an error message', async () => {
      renderBusinessProfile();

      await waitFor(() => {
        const loading = screen.getByLabelText('Business profile loading...');
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
      const name = screen.getByDisplayValue('Acme');
      expect(name).toBeInTheDocument();

      const website = screen.getByDisplayValue('https://acme.com');
      expect(website).toBeInTheDocument();

      const id = screen.getByDisplayValue('org_9L42CAdpXhDeSmi1DI8Qks');
      expect(id).toBeInTheDocument();

      const logo = screen.getByRole('img', { name: 'Acme' });
      expect(logo).toHaveAttribute('src', 'https://acme.com/logo.png');
    });

    describe('when updating organization details', () => {
      it('should display organization data in input fields', async () => {
        await renderBusinessProfileAndWaitData();

        const nameInput = screen.getByLabelText('Company name') as HTMLInputElement;
        const websiteInput = screen.getByLabelText('Website') as HTMLInputElement;
        const supportEmailInput = screen.getByLabelText('Support email') as HTMLInputElement;
        const supportPhoneInput = screen.getByLabelText('Support phone') as HTMLInputElement;
        const supportWebsiteInput = screen.getByLabelText('Support website') as HTMLInputElement;

        expect(nameInput.value).toBe(organizationFixture.name);
        expect(websiteInput.value).toBe(organizationFixture.websiteUrl);
        expect(supportEmailInput.value).toBe(organizationFixture.supportEmail);
        expect(supportPhoneInput.value).toBe(organizationFixture.supportPhone);
        expect(supportWebsiteInput.value).toBe(organizationFixture.supportWebsite);
      });

      it('should update organization details successfully', async () => {
        withUpdateOrg(updatedOrgData);
        await renderBusinessProfileAndWaitData();

        const nameInput = screen.getByLabelText('Company name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, updatedOrgData.name);

        const websiteInput = screen.getByLabelText('Website');
        await userEvent.clear(websiteInput);
        await userEvent.type(websiteInput, updatedOrgData.websiteUrl);

        const supportEmailInput = screen.getByLabelText('Support email');
        await userEvent.clear(supportEmailInput);
        await userEvent.type(supportEmailInput, updatedOrgData.supportEmail);

        const supportPhoneInput = screen.getByLabelText('Support phone');
        await userEvent.clear(supportPhoneInput);
        await userEvent.type(supportPhoneInput, updatedOrgData.supportPhone);

        const supportWebsiteInput = screen.getByLabelText('Support website');
        await userEvent.clear(supportWebsiteInput);
        await userEvent.type(supportWebsiteInput, updatedOrgData.supportWebsite);

        const submitButton = screen.getByRole('button', { name: 'Save changes' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const successToast = screen.getByText('Changes successfully saved.');
          expect(successToast).toBeInTheDocument();
        });
      });

      it('should display error toast on update failure', async () => {
        withUpdateOrgError();
        await renderBusinessProfileAndWaitData();

        const nameInput = screen.getByLabelText('Company name') as HTMLInputElement;
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Organization Name');

        const submitButton = screen.getByRole('button', { name: /save changes/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const toastTitle = screen.getByText('Uh-oh!');
          expect(toastTitle).toBeInTheDocument();
          const toastDesc = screen.getByText('Something went wrong');
          expect(toastDesc).toBeInTheDocument();
        });
      });
    });

    it('should copy organization ID to clipboard when CopyButton is clicked', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn(),
        },
      });
      await renderBusinessProfileAndWaitData();
      const copyButton = screen.getByLabelText('Copy to clipboard');
      await userEvent.click(copyButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(organizationFixture.id);
    });

    describe('org permissions', () => {
      it('should disable all inputs when user has no permissions', async () => {
        asUserWithScope([]);
        await renderBusinessProfileAndWaitData();
        await waitFor(() => {
          const inputs = screen.getAllByRole('textbox');
          expect(inputs).toHaveLength(6);
          inputs.forEach(input => {
            expect(input).toBeDisabled();
          });
        });
      });

      it('should enable all inputs except organization ID when user has permission', async () => {
        await renderBusinessProfileAndWaitData();
        await waitFor(() => {
          const inputs = screen.getAllByRole('textbox');
          expect(inputs).toHaveLength(6);

          const companyNameInput = screen.getByLabelText('Company name');
          expect(companyNameInput).toBeEnabled();

          const websiteInput = screen.getByLabelText('Website');
          expect(websiteInput).toBeEnabled();

          const supportEmailInput = screen.getByLabelText('Support email');
          expect(supportEmailInput).toBeEnabled();

          const supportPhoneInput = screen.getByLabelText('Support phone');
          expect(supportPhoneInput).toBeEnabled();

          const supportWebsiteInput = screen.getByLabelText('Support website');
          expect(supportWebsiteInput).toBeEnabled();

          const organizationIdInput = screen.getByDisplayValue(organizationFixture.id);
          expect(organizationIdInput).toBeDisabled();
        });
      });
    });
  });
});

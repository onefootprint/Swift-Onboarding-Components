import { customRender, screen, userEvent, waitFor, waitForElementToBeRemoved } from '@onefootprint/test-utils';

import {
  withAllowedDomains,
  withAllowedDomainsError,
  withEmptyAllowedDomains,
  withUpdateAllowedDomain,
  withUpdateAllowedDomainError,
} from './domain-access.test.config';
import DomainRestrictions from './domain-restrictions';

const renderDomainRestrictions = () => customRender(<DomainRestrictions />);

const renderDomainRestrictionsAndWaitData = async () => {
  renderDomainRestrictions();
  const loadingIndicator = screen.getByRole('progressbar', {
    name: 'Loading domains restrictions...',
  });
  await waitForElementToBeRemoved(loadingIndicator);
};

describe('<DomainRestrictions />', () => {
  describe('when it is loading', () => {
    beforeEach(() => {
      withAllowedDomains();
    });

    it('should show a loading indicator', async () => {
      renderDomainRestrictions();
      const loadingIndicator = screen.getByRole('progressbar', {
        name: 'Loading domains restrictions...',
      });
      expect(loadingIndicator).toBeInTheDocument();
    });
  });

  describe('when the request to get the allowed domains fails', () => {
    beforeEach(() => {
      withAllowedDomainsError();
    });

    it('should show an error message', async () => {
      await renderDomainRestrictionsAndWaitData();

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('when the request to get the allowed domains succeeds', () => {
    beforeEach(() => {
      withAllowedDomains();
    });

    it('should display "All domains are allowed" if there are no allowed domains', async () => {
      withEmptyAllowedDomains();

      await renderDomainRestrictionsAndWaitData();
      const badge = screen.getByText('All domains are allowed');
      expect(badge).toBeInTheDocument();
    });

    it('should display "Restrictions added" if there are allowed domains', async () => {
      await renderDomainRestrictionsAndWaitData();
      const badge = screen.getByText('Restrictions added');
      expect(badge).toBeInTheDocument();
    });

    it('should display the allowed domains', async () => {
      await renderDomainRestrictionsAndWaitData();
      const fp = screen.getByText('https://www.onefootprint.com');
      expect(fp).toBeInTheDocument();

      const acme = screen.getByText('https://www.acme.com');
      expect(acme).toBeInTheDocument();
    });
  });

  describe('when adding a domain to the allowed list', () => {
    beforeEach(() => {
      withAllowedDomains();
    });

    describe('when the request to add the domain fails', () => {
      beforeEach(() => {
        withUpdateAllowedDomainError();
      });

      it('should show an error message', async () => {
        await renderDomainRestrictionsAndWaitData();

        const addDomainButton = screen.getByText('Add domain');
        await userEvent.click(addDomainButton);

        const domainInput = screen.getByLabelText('URL to allow');
        await userEvent.type(domainInput, 'https://www.retro-bank.com');

        const submit = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(submit);

        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });

    describe('when the request to add the domain succeeds', () => {
      beforeEach(() => {
        withUpdateAllowedDomain();
      });

      it('should show a success message and display in the table', async () => {
        await renderDomainRestrictionsAndWaitData();
        withAllowedDomains({
          allowedOrigins: ['https://www.onefootprint.com', 'https://www.acme.com', 'https://www.retro-bank.com'],
          isLive: true,
        });

        const addDomainButton = screen.getByText('Add domain');
        await userEvent.click(addDomainButton);

        const domainInput = screen.getByLabelText('URL to allow');
        await userEvent.type(domainInput, 'https://www.retro-bank.com');

        const submit = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(submit);

        await waitFor(() => {
          const successMessage = screen.getByText('Domain added');
          expect(successMessage).toBeInTheDocument();
        });

        await waitFor(() => {
          const retroBank = screen.getByRole('listitem', {
            name: 'https://www.retro-bank.com',
          });
          expect(retroBank).toBeInTheDocument();
        });
      });
    });
  });

  describe('when removing a domain', () => {
    beforeEach(() => {
      withAllowedDomains();
    });

    describe('when the request to remove the domain fails', () => {
      beforeEach(() => {
        withUpdateAllowedDomainError();
      });

      it('should shown an error message', async () => {
        await renderDomainRestrictionsAndWaitData();

        const removeButton = screen.getByRole('button', {
          name: 'Open actions for https://www.acme.com',
        });
        await userEvent.click(removeButton);

        const remove = screen.getByRole('menuitem', { name: 'Remove' });
        await userEvent.click(remove);

        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });

    describe('when the request to remove the domain succeeds', () => {
      beforeEach(() => {
        withUpdateAllowedDomain();
      });

      it('should remove the domain', async () => {
        await renderDomainRestrictionsAndWaitData();

        const removeButton = screen.getByRole('button', {
          name: 'Open actions for https://www.acme.com',
        });
        await userEvent.click(removeButton);

        withAllowedDomains({
          allowedOrigins: [],
          isLive: true,
        });

        const remove = screen.getByRole('menuitem', { name: 'Remove' });
        await userEvent.click(remove);

        await waitFor(() => {
          const domain = screen.queryByText('https://www.acme.com');
          expect(domain).not.toBeInTheDocument();
        });
      });
    });
  });
});

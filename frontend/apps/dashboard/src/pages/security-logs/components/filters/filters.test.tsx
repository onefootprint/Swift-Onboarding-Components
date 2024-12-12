import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import Filters from './filters';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Filters />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/security-logs');
  });

  const clickFiltersButton = async () => {
    const button = screen.getByRole('button', { name: /Filters(?: \(\d+\))?/ });
    await userEvent.click(button);
  };

  it('should open the drawer when the button is clicked', async () => {
    customRender(<Filters />);
    await clickFiltersButton();
    const drawer = screen.getByRole('dialog');
    expect(drawer).toBeInTheDocument();
  });

  it('should close the drawer when the close button is clicked', async () => {
    customRender(<Filters />);
    await clickFiltersButton();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);

    const drawer = screen.queryByRole('dialog');
    expect(drawer).not.toBeInTheDocument();
  });

  it('should show all date filter options when opening drawer', async () => {
    customRender(<Filters />);
    await clickFiltersButton();

    const allTimeOption = screen.getByText('All time');
    const todayOption = screen.getByText('Today');
    const lastWeekOption = screen.getByText('Last 7 days');
    const lastMonthOption = screen.getByText('Last 30 days');
    const customOption = screen.getByText('Custom');

    expect(allTimeOption).toBeInTheDocument();
    expect(todayOption).toBeInTheDocument();
    expect(lastWeekOption).toBeInTheDocument();
    expect(lastMonthOption).toBeInTheDocument();
    expect(customOption).toBeInTheDocument();
  });

  it('should show toggle and hide individual events by default', async () => {
    customRender(<Filters />);
    await clickFiltersButton();

    const toggle = screen.getByRole('switch', { name: 'Show all events' });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toBeChecked();

    const eventCheckbox = screen.queryByRole('checkbox', { name: 'User data updated' });
    expect(eventCheckbox).not.toBeInTheDocument();
  });

  it('should show all event checkboxes unchecked when toggling off show all events', async () => {
    customRender(<Filters />);
    await clickFiltersButton();

    const toggle = screen.getByRole('switch', { name: 'Show all events' });
    await userEvent.click(toggle);

    const updateUserData = screen.getByRole('checkbox', { name: 'User data updated' });
    const deleteUserData = screen.getByRole('checkbox', { name: 'User data deleted' });
    const decryptUserData = screen.getByRole('checkbox', { name: 'User data decrypted' });

    expect(updateUserData).not.toBeChecked();
    expect(deleteUserData).not.toBeChecked();
    expect(decryptUserData).not.toBeChecked();

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    await userEvent.click(applyButton);

    await waitFor(() => {
      expect(mockRouter).toMatchObject({
        query: {
          names: [],
        },
      });
    });

    const filterButton = await screen.findByRole('button', { name: 'Filters' });
    expect(filterButton).toBeInTheDocument();
  });

  it('should reset all checkboxes to unchecked when toggling show all events back on', async () => {
    customRender(<Filters />);
    await clickFiltersButton();

    const toggle = screen.getByRole('switch', { name: 'Show all events' });
    await userEvent.click(toggle);

    const updateUserData = screen.getByRole('checkbox', { name: 'User data updated' });
    await userEvent.click(updateUserData);
    expect(updateUserData).toBeChecked();

    await userEvent.click(toggle);
    await userEvent.click(toggle);

    const resetUpdateUserData = screen.getByRole('checkbox', { name: 'User data updated' });
    expect(resetUpdateUserData).not.toBeChecked();
  });

  it('should show all event filter options when opening drawer', async () => {
    customRender(<Filters />);
    await clickFiltersButton();

    const toggle = screen.getByRole('switch', { name: 'Show all events' });
    await userEvent.click(toggle);

    const updateUserData = screen.getByText('User data updated');
    const deleteUserData = screen.getByText('User data deleted');
    const decryptUserData = screen.getByText('User data decrypted');
    const createOrgRole = screen.getByText('Role created');
    const updateOrgRole = screen.getByText('Role updated');
    const deactivateOrgRole = screen.getByText('Role deactivated');

    expect(updateUserData).toBeInTheDocument();
    expect(deleteUserData).toBeInTheDocument();
    expect(decryptUserData).toBeInTheDocument();
    expect(createOrgRole).toBeInTheDocument();
    expect(updateOrgRole).toBeInTheDocument();
    expect(deactivateOrgRole).toBeInTheDocument();
  });

  it('should change router path correctly when applying date filter', async () => {
    customRender(<Filters />);
    await clickFiltersButton();

    const lastWeekOption = screen.getByLabelText('Last 7 days');
    await userEvent.click(lastWeekOption);

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    await userEvent.click(applyButton);

    await waitFor(() => {
      expect(mockRouter).toMatchObject({
        query: {
          date_range: 'last-7-days',
        },
      });
    });
  });

  it('should change router path correctly when selecting multiple events', async () => {
    customRender(<Filters />);
    await clickFiltersButton();

    const toggle = screen.getByRole('switch', { name: 'Show all events' });
    await userEvent.click(toggle);

    const updateUserData = screen.getByLabelText('User data updated');
    const deleteUserData = screen.getByLabelText('User data deleted');
    const decryptUserData = screen.getByLabelText('User data decrypted');

    await userEvent.click(updateUserData);
    await userEvent.click(deleteUserData);
    await userEvent.click(decryptUserData);

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    await userEvent.click(applyButton);

    await waitFor(() => {
      expect(mockRouter).toMatchObject({
        query: {
          names: ['update_user_data', 'delete_user_data', 'decrypt_user_data'],
        },
      });
    });
  });

  it('should clear all filters and event names when clicking clear filters', async () => {
    mockRouter.query = {
      date_range: 'last-7-days',
      names: ['update_user_data', 'delete_user_data'],
    };

    customRender(<Filters />);
    await clickFiltersButton();

    const clearButton = screen.getByRole('button', { name: 'Clear filters' });
    await userEvent.click(clearButton);

    await waitFor(() => {
      expect(mockRouter.query).toEqual({});
    });
  });

  it('should clear event names when toggling show all events back on', async () => {
    mockRouter.query = {
      names: ['update_user_data', 'delete_user_data'],
    };

    customRender(<Filters />);
    await clickFiltersButton();

    const toggle = screen.getByRole('switch', { name: 'Show all events' });
    await userEvent.click(toggle);

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    await userEvent.click(applyButton);

    await waitFor(() => {
      expect(mockRouter.query).toEqual({
        date_range: 'all-time',
        names: [],
      });
    });
  });

  it('should display the correct number of filters in the button label', async () => {
    mockRouter.query = {
      names: ['update_user_data', 'delete_user_data'],
    };

    customRender(<Filters />);
    const button = screen.getByRole('button', { name: 'Filters (2)' });
    expect(button).toBeInTheDocument();
  });
});

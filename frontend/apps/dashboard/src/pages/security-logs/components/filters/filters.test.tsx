import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import Filters from './filters';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Filters />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/security-logs');
  });

  const clickFiltersButton = async () => {
    const button = screen.getByRole('button', { name: 'Filters' });
    await userEvent.click(button);
  };

  it('should open the drawer when the button is clicked', async () => {
    customRender(<Filters />);
    await clickFiltersButton();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should close the drawer when the close button is clicked', async () => {
    customRender(<Filters />);
    await clickFiltersButton();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show all date filter options when opening drawer', async () => {
    customRender(<Filters />);
    await clickFiltersButton();

    expect(screen.getByText('All time')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
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

  it('should clear date filter when clicking clear filters', async () => {
    mockRouter.query = {
      date_range: 'last-7-days',
    };

    customRender(<Filters />);
    await clickFiltersButton();

    const clearButton = screen.getByRole('button', { name: 'Clear filters' });
    await userEvent.click(clearButton);

    await waitFor(() => {
      expect(mockRouter.query).toEqual({});
    });
  });
});

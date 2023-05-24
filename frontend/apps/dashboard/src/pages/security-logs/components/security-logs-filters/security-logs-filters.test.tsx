import {
  createUseRouterSpy,
  customRender,
  filterEvents,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import SecurityLogsFilters from './security-logs-filters';

describe('<SecurityLogsFilters />', () => {
  const useRouterSpy = createUseRouterSpy();
  const renderSecurityLogsFilters = () => {
    customRender(<SecurityLogsFilters />);
  };

  beforeEach(() => {
    useRouterSpy({
      pathname: '/security-logs',
      query: {},
    });
  });

  it('should show all data attributes when opening popover', async () => {
    renderSecurityLogsFilters();
    const dataAttributes = screen.getByRole('button', {
      name: 'Data attributes',
    });

    expect(dataAttributes).toBeInTheDocument();
    await userEvent.click(dataAttributes);
    await waitFor(() => {
      const popover = screen.getByRole('dialog');
      expect(popover).toBeInTheDocument();
    });

    expect(screen.getByText('First name')).toBeInTheDocument();
    expect(screen.getByText('SSN (Last 4)')).toBeInTheDocument();
    expect(screen.getByText('Beneficial owner')).toBeInTheDocument();
    expect(screen.getByText('Business address data')).toBeInTheDocument();

    // There will be 2 address fields, one for business, one for personal data
    const addresses = screen.getAllByText('Address line 1');
    expect(addresses?.length).toEqual(2);
    expect(screen.getByText('Personal address data')).toBeInTheDocument();
    expect(screen.getByText('Business address data')).toBeInTheDocument();
  });

  it('should change router path correctly when applying filters', async () => {
    const pushMockFn = jest.fn();
    useRouterSpy({
      pathname: '/security-logs',
      query: {},
      push: pushMockFn,
    });
    renderSecurityLogsFilters();

    const dataAttributes = screen.getByRole('button', {
      name: 'Data attributes',
    });

    expect(dataAttributes).toBeInTheDocument();
    await userEvent.click(dataAttributes);
    await waitFor(() => {
      const popover = screen.getByRole('dialog');
      expect(popover).toBeInTheDocument();
    });

    await filterEvents.apply({
      trigger: 'Data attributes',
      options: ['First name', 'Beneficial owner'],
    });

    expect(pushMockFn).toHaveBeenCalledWith(
      {
        query: {
          data_attributes: ['id.first_name', 'business.beneficial_owners'],
        },
      },
      undefined,
      { shallow: true },
    );
  });
});

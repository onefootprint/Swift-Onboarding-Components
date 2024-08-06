import { createUseRouterSpy, customRender, filterEvents, screen, userEvent, waitFor } from '@onefootprint/test-utils';

import SecurityLogsFilters from './security-logs-filters';

describe('<SecurityLogsFilters />', () => {
  const useRouterSpy = createUseRouterSpy();
  const renderSecurityLogsFilters = () => {
    customRender(<SecurityLogsFilters />);
  };

  it('should show all data attributes when opening popovers', async () => {
    const pushMockFn = jest.fn();
    useRouterSpy({
      pathname: '/security-logs',
      query: {},
      push: pushMockFn,
    });
    renderSecurityLogsFilters();
    const personalData = screen.getByRole('button', {
      name: 'Personal data',
    });

    expect(personalData).toBeInTheDocument();
    await userEvent.click(personalData);

    await waitFor(() => {
      const popover = screen.getByRole('dialog');
      expect(popover).toBeInTheDocument();
    });

    expect(screen.getByText('First name')).toBeInTheDocument();
    expect(screen.getByText('SSN (Last 4)')).toBeInTheDocument();
    expect(screen.getByText('Address data')).toBeInTheDocument();
    expect(screen.getByText('Address line 1')).toBeInTheDocument();
    expect(screen.getByText('Legal status')).toBeInTheDocument();

    const businessData = screen.getByRole('button', {
      name: 'Business data',
    });

    expect(businessData).toBeInTheDocument();
    await userEvent.click(businessData);

    expect(screen.getByText('Beneficial owner')).toBeInTheDocument();
    expect(screen.getByText('Address data')).toBeInTheDocument();
    expect(screen.getByText('Address line 1')).toBeInTheDocument();

    // There will be 2 address fields, one for business, one for personal data
  });

  it('should change router path correctly when applying personal filters', async () => {
    const pushMockFn = jest.fn();
    useRouterSpy({
      pathname: '/security-logs',
      query: {},
      push: pushMockFn,
    });
    renderSecurityLogsFilters();

    const personalData = screen.getByRole('button', {
      name: 'Personal data',
    });

    expect(personalData).toBeInTheDocument();
    await userEvent.click(personalData);
    await waitFor(() => {
      const popover = screen.getByRole('dialog');
      expect(popover).toBeInTheDocument();
    });

    await filterEvents.apply({
      trigger: 'Personal data',
      options: ['First name', 'Last name'],
    });

    expect(pushMockFn).toHaveBeenCalledWith(
      {
        query: {
          data_attributes_personal: ['id.first_name', 'id.last_name'],
        },
      },
      undefined,
      { shallow: true },
    );
  });

  it('should change router path correctly when applying business filters', async () => {
    const pushMockFn = jest.fn();
    useRouterSpy({
      pathname: '/security-logs',
      query: {},
      push: pushMockFn,
    });
    renderSecurityLogsFilters();

    await filterEvents.apply({
      trigger: 'Business data',
      options: ['Doing Business As', 'Phone number'],
    });

    expect(pushMockFn).toHaveBeenLastCalledWith(
      {
        query: {
          data_attributes_business: ['business.dba', 'business.phone_number'],
        },
      },
      undefined,
      { shallow: true },
    );
  });

  it('should change router path correctly when applying business filters after personal filters', async () => {
    const pushMockFn = jest.fn();
    useRouterSpy({
      pathname: '/security-logs',
      query: { data_attributes_personal: ['id.first_name', 'id.phone_number'] },
      push: pushMockFn,
    });

    renderSecurityLogsFilters();

    await filterEvents.apply({
      trigger: 'Business data',
      options: ['Doing Business As', 'Phone number'],
    });

    await waitFor(() => {
      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_business: ['business.dba', 'business.phone_number'],
            data_attributes_personal: ['id.first_name', 'id.phone_number'],
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });

  it('should change router path correctly when applying personal filters after business filters', async () => {
    const pushMockFn = jest.fn();
    useRouterSpy({
      pathname: '/security-logs',
      query: {
        data_attributes_business: ['business.dba', 'business.phone_number'],
      },
      push: pushMockFn,
    });

    renderSecurityLogsFilters();

    await filterEvents.apply({
      trigger: 'Personal data',
      options: ['First name', 'Phone number'],
    });

    await waitFor(() => {
      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_personal: ['id.first_name', 'id.phone_number'],
            data_attributes_business: ['business.dba', 'business.phone_number'],
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });
});

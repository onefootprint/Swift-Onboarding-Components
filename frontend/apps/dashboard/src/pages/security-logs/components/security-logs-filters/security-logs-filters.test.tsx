import { customRender, filterEvents, mockRouter, screen, userEvent, waitFor } from '@onefootprint/test-utils';

import SecurityLogsFilters from './security-logs-filters';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<SecurityLogsFilters />', () => {
  const renderSecurityLogsFilters = () => {
    customRender(<SecurityLogsFilters />);
  };

  beforeEach(() => {
    mockRouter.setCurrentUrl('/security-logs');
  });

  it('should show all data attributes when opening popovers', async () => {
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

    expect(mockRouter).toMatchObject({
      query: {
        data_attributes_personal: ['id.first_name', 'id.last_name'],
      },
    });
  });

  it('should change router path correctly when applying business filters', async () => {
    renderSecurityLogsFilters();
    await filterEvents.apply({
      trigger: 'Business data',
      options: ['Doing Business As', 'Phone number'],
    });

    expect(mockRouter).toMatchObject({
      query: {
        data_attributes_business: ['business.dba', 'business.phone_number'],
      },
    });
  });

  it('should change router path correctly when applying business filters after personal filters', async () => {
    mockRouter.query = {
      data_attributes_personal: ['id.first_name', 'id.phone_number'],
    };
    renderSecurityLogsFilters();

    await filterEvents.apply({
      trigger: 'Business data',
      options: ['Doing Business As', 'Phone number'],
    });

    await waitFor(() => {
      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_business: ['business.dba', 'business.phone_number'],
          data_attributes_personal: ['id.first_name', 'id.phone_number'],
        },
      });
    });
  });

  it('should change router path correctly when applying personal filters after business filters', async () => {
    mockRouter.query = {
      data_attributes_business: ['business.dba', 'business.phone_number'],
    };

    renderSecurityLogsFilters();

    await filterEvents.apply({
      trigger: 'Personal data',
      options: ['First name', 'Phone number'],
    });

    await waitFor(() => {
      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_personal: ['id.first_name', 'id.phone_number'],
          data_attributes_business: ['business.dba', 'business.phone_number'],
        },
      });
    });
  });
});

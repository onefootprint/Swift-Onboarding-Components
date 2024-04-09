import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import DuplicateData from './duplicate-data';
import {
  withDuplicateDataEmpty,
  withDuplicateDataError,
  withDuplicateDataPopulated,
} from './duplicate-data.test.config';

const renderDuplicateData = () => customRender(<DuplicateData />);

const useRouterSpy = createUseRouterSpy();
const id = 'fp_id_yCZehsWNeywHnk5JqL20u';

describe('<DuplicateData/>', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/entities',
      query: {
        id,
      },
    });
  });

  it('should render the duplicate data table and correct columns and number of rows', async () => {
    withDuplicateDataPopulated();
    renderDuplicateData();

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table.getAttribute('aria-busy')).toEqual('false');
    });

    // Renders correct columns
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Footprint ID')).toBeInTheDocument();
    expect(screen.getByText('Exact match')).toBeInTheDocument();
    expect(screen.getByText('Onboarding status')).toBeInTheDocument();
    expect(screen.getByText('Created at')).toBeInTheDocument();

    // Renders correct number of rows
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('should render the same tenant data correctly when populated', async () => {
    withDuplicateDataPopulated();
    renderDuplicateData();

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table.getAttribute('aria-busy')).toEqual('false');
    });

    // Get first row
    const firstRow = screen.getAllByRole('row')[1];
    expect(firstRow).toBeInTheDocument();
    expect(within(firstRow).getByText('Jane D.')).toBeInTheDocument();
    expect(within(firstRow).getByText('fp_id_test')).toBeInTheDocument();
    expect(
      within(firstRow).queryByText('Phone number'),
    ).not.toBeInTheDocument();
    expect(within(firstRow).getByText('Email address')).toBeInTheDocument();
    expect(within(firstRow).getByText('SSN')).toBeInTheDocument();
    expect(within(firstRow).getByText('Verified')).toBeInTheDocument();
    expect(within(firstRow).getByText('10/30/24, 4:38 PM')).toBeInTheDocument();

    // Get second row
    const secondRow = screen.getAllByRole('row')[2];
    expect(secondRow).toBeInTheDocument();
    expect(within(secondRow).getByText('John T.')).toBeInTheDocument();
    expect(within(secondRow).getByText('fp_id_test2')).toBeInTheDocument();
    expect(within(secondRow).getByText('Phone number')).toBeInTheDocument();
    expect(
      within(secondRow).queryByText('Email address'),
    ).not.toBeInTheDocument();
    expect(within(secondRow).queryByText('SSN')).not.toBeInTheDocument();
    expect(within(secondRow).getByText('Failed')).toBeInTheDocument();
    expect(
      within(secondRow).getByText('11/30/23, 4:38 PM'),
    ).toBeInTheDocument();
  });

  it('Should render the other tenant data correctly when populated', async () => {
    withDuplicateDataPopulated();
    renderDuplicateData();

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table.getAttribute('aria-busy')).toEqual('false');
    });

    // Get third row
    const thirdRow = screen.getAllByRole('row')[3];
    expect(thirdRow).toBeInTheDocument();
    expect(
      within(thirdRow).getByTestId('other-tenant-summary'),
    ).toHaveTextContent('Plus 20 more matches in 10 other companies');
  });

  it('Should render correctly when same tenant data is empty', async () => {
    withDuplicateDataEmpty();
    renderDuplicateData();

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table.getAttribute('aria-busy')).toEqual('false');
    });

    // Get first row
    const firstRow = screen.getAllByRole('row')[1];
    expect(firstRow).toBeInTheDocument();
    expect(within(firstRow).getByText('No matches in')).toBeInTheDocument();

    // Get second row
    const secondRow = screen.getAllByRole('row')[2];
    expect(secondRow).toBeInTheDocument();
    expect(
      within(secondRow).getByTestId('other-tenant-summary'),
    ).toHaveTextContent('20 matches in 10 other companies');
  });

  it('Should render correctly when there is an error', async () => {
    withDuplicateDataError();
    renderDuplicateData();

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table.getAttribute('aria-busy')).toEqual('false');
    });

    // Get first row
    const firstRow = screen.getAllByRole('row')[1];
    expect(firstRow).toBeInTheDocument();
    expect(
      within(firstRow).getByText('Something went wrong'),
    ).toBeInTheDocument();
  });
});

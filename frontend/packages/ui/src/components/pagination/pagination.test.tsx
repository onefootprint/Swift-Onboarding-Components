import '../../config/initializers/i18next-test';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import type { PaginationProps } from './pagination';
import Pagination from './pagination';

describe('<Pagination />', () => {
  const renderPagination = ({
    hasNextPage = false,
    hasPrevPage = false,
    pageIndex = 0,
    pageSize = 10,
    totalNumResults = 0,
    onNextPage = jest.fn(),
    onPrevPage = jest.fn(),
  }: Partial<PaginationProps>) =>
    customRender(
      <Pagination
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalNumResults={totalNumResults}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
      />,
    );

  it('should render the text when there are results', () => {
    renderPagination({
      hasNextPage: true,
      hasPrevPage: true,
      pageIndex: 0,
      pageSize: 10,
      totalNumResults: 20,
    });
    expect(screen.getByText('Showing 1 to 10 of 20 total results')).toBeInTheDocument();
  });

  it('should render the correct text when on the last page', () => {
    renderPagination({
      hasNextPage: false,
      hasPrevPage: true,
      pageIndex: 1,
      pageSize: 10,
      totalNumResults: 20,
    });
    expect(screen.getByText('Showing 11 to 20 of 20 total results')).toBeInTheDocument();
  });

  it('should call the onNextPage function when the next button is clicked', async () => {
    const onNextPage = jest.fn();
    renderPagination({
      hasNextPage: true,
      hasPrevPage: true,
      pageIndex: 0,
      pageSize: 10,
      totalNumResults: 20,
      onNextPage,
    });

    await userEvent.click(screen.getByText('Next'));
    expect(onNextPage).toHaveBeenCalled();
  });

  it('should call the onPrevPage function when the previous button is clicked', async () => {
    const onPrevPage = jest.fn();
    renderPagination({
      hasNextPage: true,
      hasPrevPage: true,
      pageIndex: 1,
      pageSize: 10,
      totalNumResults: 20,
      onPrevPage,
    });

    await userEvent.click(screen.getByText('Previous'));
    expect(onPrevPage).toHaveBeenCalled();
  });
});

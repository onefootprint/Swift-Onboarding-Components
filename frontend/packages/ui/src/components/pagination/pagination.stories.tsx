import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import Pagination from './pagination';

export default {
  component: Pagination,
  title: 'Components/Pagination',
  argTypes: {
    hasNextPage: {
      control: 'boolean',
      description: 'Whether there is a next page',
      name: 'hasNextPage',
    },
    hasPrevPage: {
      control: 'boolean',
      description: 'Whether there is a previous page',
      name: 'hasPrevPage',
    },
    onNextPage: {
      description: 'Callback for when the next page button is clicked',
      name: 'onNextPage',
    },
    onPrevPage: {
      description: 'Callback for when the previous page button is clicked',
      name: 'onPrevPage',
    },
    pageIndex: {
      description: 'The current page index',
      name: 'pageIndex',
    },
    pageSize: {
      description: 'The number of results per page',
      name: 'pageSize',
    },
    totalNumResults: {
      description: 'The total number of results',
      name: 'totalNumResults',
    },
  },
} as Meta;

const Template: StoryFn = ({ pageIndex, pageSize, totalNumResults }) => {
  const [currentPage, setCurrentPage] = useState(pageIndex);
  const hasPrevPage = currentPage > 0;
  const hasNextPage = currentPage < Math.ceil(totalNumResults / pageSize) - 1;

  return (
    <Pagination
      pageIndex={currentPage}
      pageSize={pageSize}
      totalNumResults={totalNumResults}
      hasPrevPage={hasPrevPage}
      hasNextPage={hasNextPage}
      onPrevPage={() => setCurrentPage(currentPage - 1)}
      onNextPage={() => setCurrentPage(currentPage + 1)}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  pageIndex: 0,
  pageSize: 10,
  totalNumResults: 100,
};

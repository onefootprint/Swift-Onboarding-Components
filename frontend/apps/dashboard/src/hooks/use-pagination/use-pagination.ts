import { DEFAULT_PAGE_SIZE } from 'src/config/constants';

const useCursorPagination = ({
  count = 0,
  next = null,
  onChange,
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  count?: number;
  next?: string | null;
  onChange: (newPage: string) => void;
  page?: number;
  pageSize?: number;
}) => ({
  count,
  hasNextPage: !!next,
  hasPrevPage: page > 0,
  loadNextPage: () => {
    if (next) {
      onChange(next);
    }
  },
  loadPrevPage: () => {
    const newPage = Math.max(0, page - 1);
    onChange(newPage.toString());
  },
  pageIndex: page,
  pageSize,
});

export default useCursorPagination;

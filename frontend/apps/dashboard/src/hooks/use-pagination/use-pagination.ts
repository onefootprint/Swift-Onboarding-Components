const usePagination = ({
  count = 0,
  next = null,
  cursor = [],
  onChange,
}: {
  count?: number;
  next?: string | null;
  cursor: string[];
  onChange: (newCursor: string) => void;
}) => ({
  totalNumUsers: count || 0,
  hasNextPage: !!next,
  hasPrevPage: cursor.length > 0,
  loadNextPage: () => {
    const nextCursor = next;
    if (nextCursor) {
      const newCursor = [...cursor, nextCursor].toString();
      onChange(newCursor);
    }
  },
  loadPrevPage: () => {
    const newCursor = cursor.slice(0, -1).toString();
    onChange(newCursor);
  },
  pageIndex: cursor.length,
  pageSize: 10,
});

export default usePagination;

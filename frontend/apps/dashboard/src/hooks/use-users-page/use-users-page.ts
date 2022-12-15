import { useState } from 'react';
import useUserStore from 'src/hooks/use-user-store';
import useUserFilters, {
  getCursors,
} from 'src/pages/users/hooks/use-users-filters';

import useGetMetadataPage from './hooks/metadata/use-get-metadata-page';

const useUsersPage = (pageSize: number) => {
  const usersStore = useUserStore();
  const { filters, setCursors } = useUserFilters();
  const [totalNumUsers, setTotalNumUsers] = useState(0);

  // The backend only supports paginating forward, so we will keep a stack of the previous pages
  // we've visited in order to paginate backwards
  const cursors = getCursors(filters);
  const getMetadataPage = useGetMetadataPage(pageSize, {
    onSuccess: ({ meta }) => {
      const count = meta?.count ?? 0;
      setTotalNumUsers(count);
    },
  });

  // Add the new cursor onto the stack
  const loadNextPage = () => {
    const { meta } = getMetadataPage.data || {};
    if (meta?.next) {
      setCursors([...cursors, meta.next]);
    }
  };

  // Pop the last cursor off the stack
  const loadPrevPage = () => setCursors(cursors.slice(0, -1));

  return {
    users: usersStore.getAll(),
    totalNumUsers,
    pageIndex: cursors.length,
    isLoading: getMetadataPage.isLoading,
    loadNextPage,
    loadPrevPage,
    hasNextPage: !!getMetadataPage.data?.meta.next,
    hasPrevPage: cursors.length > 0,
  };
};
export default useUsersPage;

import useUserStore from '../use-user-store';
import useUsersPage from './use-users-page';

const useTestHook = (pageSize: number) => {
  const userStore = useUserStore();
  const usersPage = useUsersPage(pageSize);
  return { userStore, usersPage };
};

export default useTestHook;

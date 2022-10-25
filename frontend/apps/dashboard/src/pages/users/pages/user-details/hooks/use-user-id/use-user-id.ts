import { useRouter } from 'next/router';

const useUserId = () => {
  const router = useRouter();
  return router.query.footprint_user_id || '';
};

export default useUserId;

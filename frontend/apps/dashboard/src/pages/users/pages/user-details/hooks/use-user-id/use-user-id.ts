import { useRouter } from 'next/router';

const useUserId = () => {
  const router = useRouter();
  const userId = router.query.footprint_user_id;
  if (!userId) {
    return '';
  }
  if (typeof userId === 'string') {
    return userId;
  }
  return userId[0];
};

export default useUserId;

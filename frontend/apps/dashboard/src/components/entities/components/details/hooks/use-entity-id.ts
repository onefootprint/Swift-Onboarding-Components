import { useRouter } from 'next/router';

const useEntityId = () => {
  const router = useRouter();
  return router.query.id as string;
};

export default useEntityId;

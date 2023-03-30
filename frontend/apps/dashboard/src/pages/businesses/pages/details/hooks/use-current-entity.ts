import { useRouter } from 'next/router';

import useEntity from './use-entity';

const useCurrentEntity = () => {
  const router = useRouter();
  const id = router.query.id as string;
  return useEntity(id);
};

export default useCurrentEntity;

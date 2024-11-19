import { useRouter } from 'next/router';

const usePlaybookId = () => {
  const router = useRouter();
  return (router.query.playbook_id as string) || (router.query.id as string);
};

export default usePlaybookId;

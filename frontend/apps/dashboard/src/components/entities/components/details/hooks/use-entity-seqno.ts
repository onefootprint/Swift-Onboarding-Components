import { useRouter } from 'next/router';

const useEntitySeqno = (): string | undefined => {
  const router = useRouter();
  return router.query.seqno as string;
};

export default useEntitySeqno;

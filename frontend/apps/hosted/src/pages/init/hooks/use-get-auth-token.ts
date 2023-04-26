import { useRouter } from 'next/router';

const useGetAuthToken = (onSuccess: (token: string) => void) => {
  const router = useRouter();
  if (!router.isReady) {
    return;
  }

  const { token } = router.query;
  if (!token) {
    return;
  }

  if (typeof token === 'string') {
    onSuccess(token);
    return;
  }

  onSuccess(token[0]);
};

export default useGetAuthToken;

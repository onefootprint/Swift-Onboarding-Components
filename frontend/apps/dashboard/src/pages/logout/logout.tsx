import { useRouter } from 'next/router';
import useSession from 'src/hooks/use-session';
import { useEffectOnce } from 'usehooks-ts';

const Logout = () => {
  const router = useRouter();
  const session = useSession();

  useEffectOnce(() => {
    session.logOut();
    router.push('/authentication/sign-in');
  });

  return null;
};

export default Logout;

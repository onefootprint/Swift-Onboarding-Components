import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import { useToast } from 'ui/src/components/toast/toast-provider';

const Page = () => {
  const { isLive, setIsLive } = useSessionUser();
  const { show } = useToast();
  const router = useRouter();

  // We don't yet have a UI to toggle whether we're in sandbox mode or not.
  // For now, when the user visits this page, we'll toggle the mode and redirect them home
  useEffect(() => {
    router.push('/users');
    let message;
    let title;
    if (!isLive) {
      message = 'You are now in production mode';
      title = 'disabled';
    } else {
      message = 'You are now in sandbox mode';
      title = 'enabled';
    }
    show({
      description: message,
      title: `Sandbox mode ${title}`,
      variant: 'default',
    });
    setIsLive(!isLive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default Page;

import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Settings = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/settings/business-profile');
  }, [router]);

  return null;
};

export default Settings;

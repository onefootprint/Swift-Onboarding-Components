import { Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import useSession from 'src/hooks/use-session';

const Logout = () => {
  const session = useSession();

  useEffect(() => {
    session.logOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Typography variant="body-1">You are logged out</Typography>;
};

export default Logout;

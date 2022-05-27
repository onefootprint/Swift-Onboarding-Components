import useSessionUser from '@src/hooks/use-session-user';
import React, { useEffect } from 'react';
import { Typography } from 'ui';

const Logout = () => {
  const session = useSessionUser();

  useEffect(() => {
    session.logOut();
  }, []);

  return <Typography variant="body-1">You are logged out</Typography>;
};

export default Logout;

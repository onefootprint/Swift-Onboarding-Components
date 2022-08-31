import React, { useEffect } from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import { Typography } from 'ui';

const Logout = () => {
  const session = useSessionUser();

  useEffect(() => {
    session.logOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Typography variant="body-1">You are logged out</Typography>;
};

export default Logout;

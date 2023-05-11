import { Container, LinkButton } from '@onefootprint/ui';
import React from 'react';

import useSession from '../../hooks/use-session';

const Settings = ({ navigation }) => {
  const session = useSession();

  const handleLogout = () => {
    session.logOut();
    navigation.replace('EmailIdentification');
  };

  return (
    <Container scroll>
      <LinkButton onPress={handleLogout}>Logout</LinkButton>
    </Container>
  );
};

export default Settings;

import { Container, LinkButton, Table } from '@onefootprint/ui';
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
      <Table
        options={[
          {
            label: 'App',
            options: [
              {
                'aria-label': 'Logout',
                onPress: handleLogout,
                content: (
                  <LinkButton variant="destructive" onPress={handleLogout}>
                    Logout
                  </LinkButton>
                ),
              },
            ],
          },
        ]}
      />
    </Container>
  );
};

export default Settings;

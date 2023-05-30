import {
  IcoChevronRight24,
  IcoInfo24,
  IcoShare24,
  IcoSun24,
} from '@onefootprint/icons';
import { Container, LinkButton, Table } from '@onefootprint/ui';
import * as Linking from 'expo-linking';
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
            label: 'Security',
            options: [
              {
                'aria-label': "How's data collected and secured?",
                startIcon: IcoInfo24,
                content: "How's data collected and secured?",
                endIcon: IcoChevronRight24,
              },
            ],
          },
          {
            label: 'Appearance',
            options: [
              {
                'aria-label': 'Theme',
                startIcon: IcoSun24,
                content: 'Theme',
                endIcon: IcoChevronRight24,
                endText: 'Light',
              },
            ],
          },
          {
            label: 'Privacy',
            options: [
              {
                'aria-label': 'Terms of service',
                startIcon: IcoSun24,
                content: 'Terms of service',
                endIcon: IcoShare24,
                onPress: () => {
                  Linking.openURL(
                    'https://www.onefootprint.com/terms-of-service',
                  );
                },
              },
              {
                'aria-label': 'Privacy Policy',
                startIcon: IcoSun24,
                content: 'Privacy Policy',
                endIcon: IcoShare24,
                onPress: () => {
                  Linking.openURL(
                    'https://www.onefootprint.com/privacy-policy',
                  );
                },
              },
            ],
          },
          {
            label: 'App',
            options: [
              {
                'aria-label': 'Logout',
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

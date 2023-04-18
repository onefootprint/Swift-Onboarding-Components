import React from 'react';
import { Text } from 'react-native';

import useParseHandoffUrl from './hooks/use-parse-handoff-url';

const AppClip = () => {
  useParseHandoffUrl({
    onSuccess: authToken => {
      alert(authToken);
    },
    onError: () => {
      console.log('error');
    },
  });

  return <Text>AppClip</Text>;
};

export default AppClip;

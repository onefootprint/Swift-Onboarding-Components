import { Mixpanel } from 'mixpanel-react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { IS_DEV, MIXPANEL_TOKEN } from '../../config/constants';

export type AnalyticsProps = {
  debug?: boolean;
  children: React.ReactNode;
};

export const AnalyticsContext = createContext(null);

export const useAnalytics = (): Mixpanel => useContext(AnalyticsContext);

const Provider = ({ debug, children }: AnalyticsProps) => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (IS_DEV || debug) {
      setAnalytics({
        track: args => console.log('track', args),
        timeEvent: args => console.log('timeEvent', args),
      });
      return;
    }

    const trackAutomaticEvents = true;
    const mixpanel = new Mixpanel(MIXPANEL_TOKEN, trackAutomaticEvents);
    mixpanel.init();
    setAnalytics(mixpanel);
  }, []);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default Provider;

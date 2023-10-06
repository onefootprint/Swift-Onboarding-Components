import { Mixpanel } from 'mixpanel-react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { MIXPANEL_TOKEN } from '../../config/constants';

export type AnalyticsProps = {
  children: React.ReactNode;
};

export const AnalyticsContext = createContext(null);

export const useAnalytics = (): Mixpanel => useContext(AnalyticsContext);

const Provider = ({ children }: AnalyticsProps) => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
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

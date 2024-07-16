import { Mixpanel, type MixpanelProperties } from 'mixpanel-react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { IS_DEV, MIXPANEL_TOKEN } from '../../config/constants';

export type AnalyticsProps = {
  debug?: boolean;
  children: React.ReactNode;
};

type AnalyticsContextType = {
  track: (eventName: string, properties?: MixpanelProperties) => void;
  timeEvent: (eventName: string) => void;
};

export const AnalyticsContext = createContext<AnalyticsContextType>({
  track: (eventName: string, properties?: MixpanelProperties) => console.log('track', eventName, properties),
  timeEvent: (eventName: string) => console.log('timeEvent', eventName),
});

export const useAnalytics = () => useContext(AnalyticsContext);

const Provider = ({ debug, children }: AnalyticsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsContextType>({
    track: args => console.log('track', args),
    timeEvent: args => console.log('timeEvent', args),
  });

  useEffect(() => {
    if (IS_DEV || debug) return;
    const trackAutomaticEvents = true;
    const mixpanel = new Mixpanel(MIXPANEL_TOKEN, trackAutomaticEvents);
    mixpanel.init();
    setAnalytics(mixpanel);
  }, [debug]);

  return <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>;
};

export default Provider;

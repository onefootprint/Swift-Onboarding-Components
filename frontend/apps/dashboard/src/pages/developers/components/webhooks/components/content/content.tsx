import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import React from 'react';

import { GetWebhooksPortalResponse } from '../../hooks/use-webhooks-portal';

const AppPortal = dynamic(
  {
    loader: () => import('svix-react').then(mod => mod.AppPortal),
  },
  {
    ssr: false,
  },
);

export type ContentProps = {
  data: GetWebhooksPortalResponse;
};

const Content = ({ data }: ContentProps) => {
  const { systemTheme } = useTheme();

  return (
    <AppPortal
      darkMode={systemTheme === 'dark'}
      fontFamily="DM Sans"
      fullSize
      url={data.url}
    />
  );
};

export default Content;

import dynamic from 'next/dynamic';
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

const Content = ({ data }: ContentProps) => (
  <AppPortal fullSize fontFamily="DM Sans" url={data.url} />
);

export default Content;

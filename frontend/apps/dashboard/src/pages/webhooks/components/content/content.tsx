import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

import type { GetWebhooksPortalResponse } from '../../hooks/use-webhooks-portal';

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
  const { theme } = useTheme();

  return <AppPortal darkMode={theme === 'dark'} fontFamily="DM Sans" fullSize url={data.url} />;
};

export default Content;

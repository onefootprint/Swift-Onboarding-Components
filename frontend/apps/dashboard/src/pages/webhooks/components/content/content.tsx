import type { WebhookPortalResponse } from '@onefootprint/request-types/dashboard';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

export type ContentProps = {
  data: WebhookPortalResponse;
};

const Content = ({ data }: ContentProps) => {
  const { theme } = useTheme();

  return <AppPortal darkMode={theme === 'dark'} fontFamily="DM Sans" fullSize url={data.url} />;
};

const AppPortal = dynamic(
  {
    loader: () => import('svix-react').then(mod => mod.AppPortal),
  },
  {
    ssr: false,
  },
);

export default Content;

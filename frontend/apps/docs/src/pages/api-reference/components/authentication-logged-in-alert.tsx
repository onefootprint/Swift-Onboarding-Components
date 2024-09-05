import Link from 'next/link';
import DocsInlineAlert from 'src/components/markdown/components/docs-inline-alert';
import useSession from 'src/hooks/use-session';
import useGetSandboxApiKey from '../hooks/use-get-sandbox-api-key';

const AuthenticationLoggedInAlert = () => {
  const apiKey = useGetSandboxApiKey();
  const { isLoggedIn } = useSession();
  if (apiKey.data) {
    return (
      <DocsInlineAlert variant="info">
        Your sandbox API keys are included in the example cURL requests here, so you can test examples right away. Only
        you can see this value.
      </DocsInlineAlert>
    );
  }
  if (isLoggedIn) {
    // Logged in without an admin API key - encourage to create one
    return (
      <DocsInlineAlert variant="info">
        Create a sandbox API key with admin permissions on your{' '}
        <Link href="https://dashboard.onefootprint.com/api-keys?mode=sandbox" target="_blank">
          dashboard
        </Link>{' '}
        to view your own API key in the example cURL requests here.
      </DocsInlineAlert>
    );
  }
  return (
    <DocsInlineAlert variant="info">
      Log into the docs site to see your sandbox API keys in the example cURL requests here and test examples right
      away.
    </DocsInlineAlert>
  );
};

export default AuthenticationLoggedInAlert;

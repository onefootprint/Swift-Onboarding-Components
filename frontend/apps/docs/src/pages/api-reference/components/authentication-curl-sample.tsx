import Code from 'src/components/markdown/components/code';
import useGetSandboxApiKey from '../hooks/use-get-sandbox-api-key';

type AuthenticationCurlSampleProps = { variant: 'header' | 'basic' };

/** Helper to render the two sample curl requests in the authentication section. This is needed to pull in the sandbox API key for the logged-in user. */
const AuthenticationCurlSample = ({ variant }: AuthenticationCurlSampleProps) => {
  const apiKey = useGetSandboxApiKey();
  const lines = ['curl https://api.onefootprint.com/users \\'];
  let filename;
  if (variant === 'basic') {
    lines.push(`  -u ${apiKey.data?.key || 'sk_test_xxxxx'}:`);
    lines.push('# The colon prevents curl from asking for a password.');
    filename = 'HTTP Basic authentication';
  } else {
    lines.push(`  -H "X-Footprint-Secret-Key: ${apiKey.data?.key || 'sk_test_xxxxx'}"`);
    lines.push('# Alternatively, you may provide the X-Footprint-Secret-Key header');
    filename = 'Header authentication';
  }
  return (
    <Code className="bash" filename={filename}>
      {lines.join('\n')}
    </Code>
  );
};

export default AuthenticationCurlSample;

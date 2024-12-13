import { mockRequest, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import type { ProxyConfigDetails } from '@onefootprint/types';
import { asAdminUser, resetUser } from 'src/config/tests';

beforeEach(() => {
  asAdminUser();
});

afterAll(() => {
  resetUser();
});

export const withCreateProxyConfig = (proxyConfig: Partial<ProxyConfigDetails>) =>
  mockRequest({
    method: 'post',
    path: '/org/proxy_configs',
    response: {
      ...proxyConfig,
    },
  });

export const withCreateProxyConfigError = () =>
  mockRequest({
    method: 'post',
    path: '/org/proxy_configs',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

const next = async () => {
  const nextButton = screen.getByRole('button', { name: 'Next' });
  await userEvent.click(nextButton);
};

export const filloutForm = async () => {
  const dialogTriggerButton = screen.getByRole('button', {
    name: 'Create vault proxy config',
  });
  await userEvent.click(dialogTriggerButton);

  await waitFor(() => {
    const dialog = screen.getByRole('dialog', {
      name: 'Create vault proxy config',
    });
    expect(dialog).toBeInTheDocument();
  });

  // Step 1: Basic config
  const nameField = screen.getByLabelText('Name');
  await userEvent.type(nameField, 'My proxy config');

  const urlField = screen.getByLabelText('URL');
  await userEvent.type(urlField, 'https://ditto.footprint.dev:8443');

  const accessReasonField = screen.getByLabelText('Access reason');
  await userEvent.type(accessReasonField, 'Lorem ipsum dolor simet');

  await next();

  // Step 2: headers
  await waitFor(() => {
    const title = screen.getByText('Custom header values');
    expect(title).toBeInTheDocument();
  });

  const headerNameField = screen.getByLabelText('Name');
  await userEvent.type(headerNameField, 'header-name');

  const headerValueField = screen.getByLabelText('Value');
  await userEvent.type(headerValueField, 'header-value');

  await next();

  // Step 3:
  await waitFor(() => {
    const title = screen.getByText('Client certificate authentication (mTLS)');
    expect(title).toBeInTheDocument();
  });

  const certificateField = screen.getByLabelText('Certificate');
  await userEvent.type(certificateField, certificate);

  const privateKeyField = screen.getByLabelText('Key (Encrypted)');
  await userEvent.type(privateKeyField, key);

  await next();

  // Step 4: Pinned server certificates
  await waitFor(() => {
    const title = screen.getByText('Pinned server certificates');
    expect(title).toBeInTheDocument();
  });

  const pinnedCertificateField = screen.getByLabelText('Certificate');
  await userEvent.type(pinnedCertificateField, certificate);

  await next();

  // Step 5: Ingress Vaulting
  await waitFor(() => {
    const title = screen.getByText('Ingress vaulting');
    expect(title).toBeInTheDocument();
  });

  const submitButton = screen.getByRole('button', { name: 'Save' });
  await userEvent.click(submitButton);
};

const certificate = `
-----BEGIN CERTIFICATE-----
MIIFczCCA1ugAwIBAgIUPB4QJPVk2pbJm64bYGtIb6qaHOwwDQYJKoZIhvcNAQEL
BQAwZjELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk1BMQwwCgYDVQQHDANCT1MxEzAR
BgNVBAoMClRlc3RDbGllbnQxJzAlBgkqhkiG9w0BCQEWGHRlc3RjbGllbnRAZm9v
dHByaW50LmRldjAeFw0yMzAyMTAyMjQzNDRaFw0zMzAyMDcyMjQzNDRaMGYxCzAJ
BgNVBAYTAlVTMQswCQYDVQQIDAJNQTEMMAoGA1UEBwwDQk9TMRMwEQYDVQQKDApU
ZXN0Q2xpZW50MScwJQYJKoZIhvcNAQkBFhh0ZXN0Y2xpZW50QGZvb3RwcmludC5k
ZXYwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQComX0JuYEJLhKlUarK
U06LAhsM0YUqpTFPE2pfOFLlxLbglxq2503E6OKga8g32uQlB3iPBKxq70nBXJdw
1X12ULIhz1AKmm8w+4xqP0Z6TY3bITu04DuRMHKpPQqXFWPUu7Dpg5nwlrNFuMIK
mVP5hllgFXE/Z0gyiUzmLdKAwvOd7nIUNUL1mrA6XmHfnDteMgKi4iRnnWsjCdjo
RSyzaOSnqJbdOgOXLopG6HKsHrdqRYFXe37tCQMlp26ykaAvR7ZMEjRJqQ9zmufI
pJ2qvZicx58z5CJv42PpRkuvegHRPmgBNkNJfqOOzV0YOfS3IPduD1q0I0es6h17
NqVR2it/tXh4iayZ7vhaUnyJPTBOXLNQ1CTSe+HUoBF0+MReBkKXptD08hhfsr0y
eOOeuFH5UuRFXp0TmyE+0IFtD5EIGbblFeZmXxG4SR5rIHQ8XXEA9MHyg/Zgf10a
CjiE/HXXoMy7GG6RRU1M3hchRVu5vOzH/rEXCvuKlG0+MJ0bI+R6vkwwTHO6h0P8
YIL5fgYUz8P1RA11D/4JWCJg+xCJZYs7tfMfyNAwrLDSVJg0nJ9ZQTpL4FynbQZO
avWRER9TGb7XhkXy0ROM6Wj6oquKViUQKjazrCogFQWhswhzAepKTFYBWjgRsdj+
O6cCmJJ+DqN4Kwr5haPDM/ULsQIDAQABoxkwFzAVBgNVHREEDjAMggp0ZXN0Y2xp
ZW50MA0GCSqGSIb3DQEBCwUAA4ICAQAEYLxS7sNjmPDXhpw5xwHFeUhNxblXoWVp
WQewFPNk9xoeRKLbCzZJsqORxJ+nFEXbD212/YlheV2TVIx6u0v8zT979IMcfQPi
TWeZFV8ZIRUyi4tTzXAuq3smajT5ta4ntAN3TR4DS89kwXGs/vSgOnG4JGY5pVR5
7L4eS4r3PDvQJYvDAOO/tGgV0TstNz9r4J6KnArr2Uyw0TW0EfLJG/abDoUEAt9u
HuKvNTjRNakhhQyRmMMbVPpKl6s1ylyqhzw/ZDlafLjqQGXDaZd4HR2J9FxVI/uC
xpWffo/RjuXHCl4opup9rfulAnuBAOyQUbLHUqh4M4ydYoWIUmI5Nvd3FeX3Yvrh
8azXAUReV1mJlBLsFYKrTmW24efTOMKS2R6td3LRbOu3BbIBvLb/+F0p39ku1Hh/
y9y7MNgYJPUjPCzhT5krien5qUe8YbjWtgPm9fICnLsA2wZvSxxBtxOSSh7Yq+0f
ACmkx7Lmi9tboU5upmzjKkh7tw4X1xVmHymC2TcbQBViu3NjmuUnw23apg3gjv8r
kStWe6hgUORrl1xUBbmDyUKBUAGzCIACR9070EvHbnUKVG1NNduBQ0rYx8wPmQCS
MUK2SJIpjNXbbrnPxn9MIP+A9GrWRljUgIMbkTqrZnucxb4Fe4wB+NaJORYowRPR
6wKeN/A3Ag==
-----END CERTIFICATE-----
`;

// nosemgrep
const key = `-----BEGIN PRIVATE KEY-----
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
xeauFSQxuf/D6gVaDkVV8ntjgtnkbmgB
-----END PRIVATE KEY-----
`;

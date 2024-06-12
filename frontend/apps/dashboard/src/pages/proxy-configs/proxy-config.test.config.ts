import { mockRequest } from '@onefootprint/test-utils';
import type { ProxyConfig, ProxyConfigDetails } from '@onefootprint/types';
import { asAdminUser, resetUser } from 'src/config/tests';

beforeEach(() => {
  asAdminUser();
});

afterAll(() => {
  resetUser();
});

export const proxyConfigsFixture: ProxyConfig[] = [
  {
    id: 'proxy_id_rBXHrA7oUgN8m7YfVVJKC4',
    isLive: true,
    name: 'Name of the proxy config',
    createdAt: '2023-03-03T00:28:13.097885Z',
    status: 'enabled',
    url: 'https://my-test-url.com/',
    method: 'GET',
    deactivatedAt: null,
  },
];

export const proxyConfigDetailsFixture: ProxyConfigDetails = {
  id: 'proxy_id_rBXHrA7oUgN8m7YfVVJKC4',
  isLive: true,
  name: 'Name of the proxy config',
  createdAt: '2023-03-03T00:28:13.097885Z',
  status: 'enabled',
  deactivatedAt: null,
  url: 'https://my-test-url.com/',
  method: 'GET',
  clientCertificate:
    '-----BEGIN CERTIFICATE-----\r\nMIIFczCCA1ugAwIBAgIUPB4QJPVk2pbJm64bYGtIb6qaHOwwDQYJKoZIhvcNAQEL\r\nBQAwZjELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk1BMQwwCgYDVQQHDANCT1MxEzAR\r\nBgNVBAoMClRlc3RDbGllbnQxJzAlBgkqhkiG9w0BCQEWGHRlc3RjbGllbnRAZm9v\r\ndHByaW50LmRldjAeFw0yMzAyMTAyMjQzNDRaFw0zMzAyMDcyMjQzNDRaMGYxCzAJ\r\nBgNVBAYTAlVTMQswCQYDVQQIDAJNQTEMMAoGA1UEBwwDQk9TMRMwEQYDVQQKDApU\r\nZXN0Q2xpZW50MScwJQYJKoZIhvcNAQkBFhh0ZXN0Y2xpZW50QGZvb3RwcmludC5k\r\nZXYwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQComX0JuYEJLhKlUarK\r\nU06LAhsM0YUqpTFPE2pfOFLlxLbglxq2503E6OKga8g32uQlB3iPBKxq70nBXJdw\r\n1X12ULIhz1AKmm8w+4xqP0Z6TY3bITu04DuRMHKpPQqXFWPUu7Dpg5nwlrNFuMIK\r\nmVP5hllgFXE/Z0gyiUzmLdKAwvOd7nIUNUL1mrA6XmHfnDteMgKi4iRnnWsjCdjo\r\nRSyzaOSnqJbdOgOXLopG6HKsHrdqRYFXe37tCQMlp26ykaAvR7ZMEjRJqQ9zmufI\r\npJ2qvZicx58z5CJv42PpRkuvegHRPmgBNkNJfqOOzV0YOfS3IPduD1q0I0es6h17\r\nNqVR2it/tXh4iayZ7vhaUnyJPTBOXLNQ1CTSe+HUoBF0+MReBkKXptD08hhfsr0y\r\neOOeuFH5UuRFXp0TmyE+0IFtD5EIGbblFeZmXxG4SR5rIHQ8XXEA9MHyg/Zgf10a\r\nCjiE/HXXoMy7GG6RRU1M3hchRVu5vOzH/rEXCvuKlG0+MJ0bI+R6vkwwTHO6h0P8\r\nYIL5fgYUz8P1RA11D/4JWCJg+xCJZYs7tfMfyNAwrLDSVJg0nJ9ZQTpL4FynbQZO\r\navWRER9TGb7XhkXy0ROM6Wj6oquKViUQKjazrCogFQWhswhzAepKTFYBWjgRsdj+\r\nO6cCmJJ+DqN4Kwr5haPDM/ULsQIDAQABoxkwFzAVBgNVHREEDjAMggp0ZXN0Y2xp\r\nZW50MA0GCSqGSIb3DQEBCwUAA4ICAQAEYLxS7sNjmPDXhpw5xwHFeUhNxblXoWVp\r\nWQewFPNk9xoeRKLbCzZJsqORxJ+nFEXbD212/YlheV2TVIx6u0v8zT979IMcfQPi\r\nTWeZFV8ZIRUyi4tTzXAuq3smajT5ta4ntAN3TR4DS89kwXGs/vSgOnG4JGY5pVR5\r\n7L4eS4r3PDvQJYvDAOO/tGgV0TstNz9r4J6KnArr2Uyw0TW0EfLJG/abDoUEAt9u\r\nHuKvNTjRNakhhQyRmMMbVPpKl6s1ylyqhzw/ZDlafLjqQGXDaZd4HR2J9FxVI/uC\r\nxpWffo/RjuXHCl4opup9rfulAnuBAOyQUbLHUqh4M4ydYoWIUmI5Nvd3FeX3Yvrh\r\n8azXAUReV1mJlBLsFYKrTmW24efTOMKS2R6td3LRbOu3BbIBvLb/+F0p39ku1Hh/\r\ny9y7MNgYJPUjPCzhT5krien5qUe8YbjWtgPm9fICnLsA2wZvSxxBtxOSSh7Yq+0f\r\nACmkx7Lmi9tboU5upmzjKkh7tw4X1xVmHymC2TcbQBViu3NjmuUnw23apg3gjv8r\r\nkStWe6hgUORrl1xUBbmDyUKBUAGzCIACR9070EvHbnUKVG1NNduBQ0rYx8wPmQCS\r\nMUK2SJIpjNXbbrnPxn9MIP+A9GrWRljUgIMbkTqrZnucxb4Fe4wB+NaJORYowRPR\r\n6wKeN/A3Ag==\r\n-----END CERTIFICATE-----\r\n',
  headers: [
    {
      name: 'my-test-header',
      value: 'my-test-value',
    },
  ],
  secretHeaders: [
    {
      id: 'pc_sechdr_Z180kd05sN30rcTFCTcujy',
      name: 'my-secret-header',
    },
  ],
  pinnedServerCertificates: [
    '-----BEGIN CERTIFICATE-----\r\nMIIFiDCCA3CgAwIBAgIJAJONEl2kNCyoMA0GCSqGSIb3DQEBCwUAMGAxCzAJBgNV\r\nBAYTAlVTMQswCQYDVQQIDAJNQTEPMA0GA1UEBwwGQk9TVE9OMRUwEwYDVQQLDAxP\r\nTkVGT09UUFJJTlQxHDAaBgNVBAMME2RpdHRvLmZvb3RwcmludC5kZXYwHhcNMjMw\r\nMTEyMjE1MzM4WhcNMzMwMTA5MjE1MzM4WjBgMQswCQYDVQQGEwJVUzELMAkGA1UE\r\nCAwCTUExDzANBgNVBAcMBkJPU1RPTjEVMBMGA1UECwwMT05FRk9PVFBSSU5UMRww\r\nGgYDVQQDDBNkaXR0by5mb290cHJpbnQuZGV2MIICIjANBgkqhkiG9w0BAQEFAAOC\r\nAg8AMIICCgKCAgEA0F5Y0DkQ2vMp7yeP7HfNhTNxbkJqJeIyRMEFDtWFb2Q3vRKY\r\nXVNynvgu9jOootRR1cHHblDRGiK/q8/8RI0ajiVuTlB9rDzAPM1cc/Kw4woVp3C9\r\ncgkZjf05pBYSP+29Zq7T4jWE9YVLqq7lYS9dLs7D8UnTsWhqVBcQTuPEdd+vaT6c\r\nBeIRO6/5NfqQFjiR9AW2LqbGlmqNH4e+99c7RE5t5u5rutuGgyqAG2IhBkCjTg9z\r\no3RNs70hb397IL3/0asgyIqljYEOyxJwcp7LKQUwJiKJcQ3CFvkntO0yXVQVciBs\r\n/y8bTB0MVcC2O9jPM/l127EKfu3gpaVrpPyAxcH/T/J0Z6xRKWBq3kWvUug6VanR\r\nfIUWNpbArveZDq36Ir8yEeNqPRdaxBkiVFBCe2x5EoU4qvGCHs4F51P60nnCzIie\r\noqLTkKuE4+Lz+CzFlNVzm3ts7urloO3MfWI+P8IKvKOHphgd5iJk1veOc2nnB5jz\r\n/28C6V6uiUVS7WkXe2GUNjQDwae0vScV6HLxBxZJm9smCiZB16urYjNUC2DGJ+XZ\r\ns2KfXF+eXFNVf+iUCvrway2EdhZ4GwWD6tA3qAcyhXT3J40vjlKobhomhLKprhRF\r\n1ESngbd0k8ZzaG20qGajgz3PruiJ5fix3RdnobLresDpNCUg8GJYdowk9LkCAwEA\r\nAaNFMEMwCQYDVR0TBAIwADALBgNVHQ8EBAMCBeAwKQYDVR0RBCIwIIIJbG9jYWxo\r\nb3N0ghNkaXR0by5mb290cHJpbnQuZGV2MA0GCSqGSIb3DQEBCwUAA4ICAQAQNJfO\r\nRfVDAEY+fVrETs8xJ5aEPCtTbPTSUHM0axpQ/Yw2GRFNosf5o7yL97zP79zI2gD3\r\nDWJ9NF/+SyTON9/w/sqvEJC9msXkJYq3GJZjG9dgq/DJhP5it/gaXejOK+3q1bpT\r\nRbkBNymoRzUDcVqB8bVTWifwx4CEkNOVk8hhKuaIKA/hjsjxxn4KP+go+4X5qWWM\r\n1OSEloQfK+gICf050hsuT1zZfX7s6lvuKGon6jAAv8pTtSFTYL+2gJcYXxzvKJgv\r\nnAte2x33w1poH5F8fI8GdEh8HVw+LHl5r3AWWWGxPr4HnwZFwIDcSOs8XI+7ekXr\r\nGPic7e2OSDO3+7/po9AceaJkGBLmupfM/u2GOvBdTZWm+QmFCS9ho+v4LWEz9E9p\r\njqwTZvE/NOgEnlLBoCY2RktulF2uWr3aHRLHqpP11wGE90gV4zozV3iu1MFtaxPc\r\n6qKkL932IgwmDJSQrMgxmY3XpRVrfnBsDQm9/yx5DYN9rVQdXZXv/1TH6H02pudu\r\nx+XSPRM/LFkFLxshTG8ol1qSPjX0tx+F2ws2ZjKAqpm8R+0jx49sNtexdcToiDzH\r\ns8QM0vl0WMEhwFr6VRl8dva8Wj3sxASBa1IniQDKTsKTiS8aCXX1CeZNhJbvpDsu\r\nkXRDXHwTi4jiuApDF+K1UE9PaMnaPhhS6r1ctQ==\r\n-----END CERTIFICATE-----\r\n',
  ],
  accessReason: 'Some reason',
  ingressContentType: 'json',
  ingressRules: [
    {
      token: 'custom.card_number',
      target: '$.data.card_number',
    },
  ],
};

export const withProxyConfigs = (proxyConfigs: ProxyConfig[] = proxyConfigsFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/proxy_configs',
    response: proxyConfigs,
  });

export const withProxyConfigsError = () =>
  mockRequest({
    method: 'get',
    path: '/org/proxy_configs',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withProxyConfigDetails = (id: string, response = proxyConfigDetailsFixture) =>
  mockRequest({
    method: 'get',
    path: `/org/proxy_configs/${id}`,
    response,
  });

export const withProxyConfigDetailsError = (id: string) =>
  mockRequest({
    method: 'get',
    path: `/org/proxy_configs/${id}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withEditProxyConfig = (proxyConfig: ProxyConfigDetails, newProxyConfig: Partial<ProxyConfigDetails>) =>
  mockRequest({
    method: 'patch',
    path: `/org/proxy_configs/${proxyConfig.id}`,
    response: {
      ...proxyConfig,
      ...newProxyConfig,
    },
  });

export const withEditProxyConfigError = (proxyConfig: ProxyConfigDetails) =>
  mockRequest({
    method: 'patch',
    path: `/org/proxy_configs/${proxyConfig.id}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withRemoveProxyConfig = (proxyConfig: ProxyConfigDetails) =>
  mockRequest({
    method: 'post',
    path: `/org/proxy_configs/${proxyConfig.id}/deactivate`,
    response: {},
  });

export const withRemoveProxyConfigError = (proxyConfig: ProxyConfigDetails) =>
  mockRequest({
    method: 'post',
    path: `/org/proxy_configs/${proxyConfig.id}/deactivate`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

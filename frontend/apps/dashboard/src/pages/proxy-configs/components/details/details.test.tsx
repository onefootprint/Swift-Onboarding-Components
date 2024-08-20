import {
  createFileSaverSpy,
  customRender,
  mockRouter,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';

import Details from './details';
import { proxyConfigDetailsFixture, withProxyConfigDetails, withProxyConfigDetailsError } from './details.test.config';

const fileSaverSpy = createFileSaverSpy();

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Details />', () => {
  const fileSaverMock = fileSaverSpy();

  beforeEach(() => {
    mockRouter.setCurrentUrl('/developers');
    mockRouter.query = {
      proxy_config_id: proxyConfigDetailsFixture.id,
    };
  });

  const renderDetails = () => {
    customRender(<Details />);
  };

  const renderDetailsAndWaitData = async () => {
    renderDetails();

    await waitFor(() => {
      const content = screen.getByTestId('proxy-configs-details-content');
      expect(content).toBeInTheDocument();
    });
  };

  describe('when the request to fetch the proxy details fails', () => {
    beforeEach(() => {
      withProxyConfigDetailsError(proxyConfigDetailsFixture.id);
    });

    it('should show the error message', async () => {
      renderDetails();

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });

  describe('when the request to fetch the proxy details succeeds', () => {
    beforeEach(() => {
      withProxyConfigDetails(proxyConfigDetailsFixture.id);
    });

    it('should show the details of the proxy config', async () => {
      await renderDetailsAndWaitData();

      const urlRow = screen.getByRole('row', {
        name: 'URL',
      });
      const urlValue = within(urlRow).getByText(proxyConfigDetailsFixture.url);
      expect(urlValue).toBeInTheDocument();

      const httpRow = screen.getByRole('row', {
        name: 'HTTP Method',
      });
      const httpValue = within(httpRow).getByText(proxyConfigDetailsFixture.method);
      expect(httpValue).toBeInTheDocument();

      const accessReasonRow = screen.getByRole('row', {
        name: 'Access reason',
      });
      const accessReasonValue = within(accessReasonRow).getByText(proxyConfigDetailsFixture.accessReason);
      expect(accessReasonValue).toBeInTheDocument();

      proxyConfigDetailsFixture.secretHeaders.forEach(header => {
        const headerName = screen.getByText(header.name);
        expect(headerName).toBeInTheDocument();
      });

      proxyConfigDetailsFixture.headers.forEach(header => {
        const headerName = screen.getByText(header.name);
        expect(headerName).toBeInTheDocument();

        const headerValue = screen.getByText(header.value);
        expect(headerValue).toBeInTheDocument();
      });

      const download = screen.getByRole('button', {
        name: 'Download client certificate',
      });
      await userEvent.click(download);
      expect(fileSaverMock).toHaveBeenCalledWith(
        {
          content: expect.anything(),
          options: {
            type: 'text/plain;charset=utf-8',
          },
        },
        'name-of-the-proxy-config-client-certificate.crt',
      );

      const downloadPinnedServerCertificate = screen.getByRole('button', {
        name: 'Download pinned server certificate',
      });
      await userEvent.click(downloadPinnedServerCertificate);
      expect(fileSaverMock).toHaveBeenCalledWith(
        {
          content: expect.anything(),
          options: {
            type: 'text/plain;charset=utf-8',
          },
        },
        'name-of-the-proxy-config-pinned-server-certificate.crt',
      );

      const contentTypeRow = screen.getByRole('row', {
        name: 'Content type',
      });
      const contentType = proxyConfigDetailsFixture.ingressContentType ?? '';
      const contentTypeValue = within(contentTypeRow).getByText(contentType, {
        exact: false,
      });
      expect(contentTypeValue).toBeInTheDocument();

      proxyConfigDetailsFixture.ingressRules.forEach(rule => {
        const ruleToken = screen.getByText(rule.token);
        expect(ruleToken).toBeInTheDocument();

        const ruleTarget = screen.getByText(rule.target);
        expect(ruleTarget).toBeInTheDocument();
      });
    });
  });
});

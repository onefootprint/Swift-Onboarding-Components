import { screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { ChallengeKind, CollectedKycDataOption, IdDI } from '@onefootprint/types';

import getInitialContext from './get-initial-context';
import getRequirement from './get-requirement';
import {
  mockGenerateBiometricResponseImpl,
  mockGetBiometricChallengeResponse,
  withDecryptUser,
  withIdentify,
  withIdentifyVerify,
  withLoginChallenge,
  withUserToken,
  withUserVault,
} from './identity-section.test.config';
import { renderIdentitySection } from './render-identity-section';

jest.mock('../hooks/use-step-up/utils/get-biometric-challenge-response', () => ({
  __esModule: true,
  ...jest.requireActual('../hooks/use-step-up/utils/get-biometric-challenge-response'),
}));

describe('IdentitySection', () => {
  beforeEach(() => {
    withIdentify([ChallengeKind.biometric], true);
    withIdentifyVerify();
    withLoginChallenge(ChallengeKind.biometric);
    withUserToken([]);
    mockGetBiometricChallengeResponse();
  });

  describe('when the SSN value is not encrypted', () => {
    const data = {
      [IdDI.ssn4]: {
        value: '1234',
        scrubbed: false,
      },
    };

    it('the Edit button should be present', async () => {
      const initialContext = getInitialContext({ data });
      renderIdentitySection(initialContext);

      const editButton = screen.getByTestId('identity-edit-button');
      expect(editButton).toBeInTheDocument();
    });

    it('the SSN should be hidden and the Reveal button should be present', async () => {
      const initialContext = getInitialContext({ data });
      renderIdentitySection(initialContext);

      await waitFor(() => {
        expect(screen.getByText('•'.repeat(4))).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId('identity-reveal-button')).toBeInTheDocument();
      });
    });

    it('the Reveal button should be replaced by a Hide button after clicked', async () => {
      const initialContext = getInitialContext({ data });
      renderIdentitySection(initialContext);

      await waitFor(() => {
        const revealButton = screen.getByTestId('identity-reveal-button');
        expect(revealButton).toBeInTheDocument();
      });
      const revealButton = screen.getByTestId('identity-reveal-button');
      await userEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByText(data[IdDI.ssn4].value)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId('identity-hide-button')).toBeInTheDocument();
      });
    });

    it('the Reveal and Hide buttons should not be present when editing', async () => {
      const initialContext = getInitialContext({ data });
      renderIdentitySection(initialContext);

      const editButton = screen.getByTestId('identity-edit-button');
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.queryByTestId('identity-reveal-button')).toBeNull();
      });
      await waitFor(() => {
        expect(screen.queryByTestId('identity-hide-button')).toBeNull();
      });
    });

    it('the SSN should hidden after being edited', async () => {
      const initialContext = getInitialContext({ data });
      renderIdentitySection(initialContext);
      withUserVault();

      const editButton = screen.getByTestId('identity-edit-button');
      await userEvent.click(editButton);

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
      });
      await userEvent.type(screen.getByRole('textbox'), '4321');

      await waitFor(() => {
        const saveButton = screen.getByTestId('ssn-save-edit-button');
        expect(saveButton).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('ssn-save-edit-button'));

      await waitFor(() => {
        expect(screen.getByText('•'.repeat(4))).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId('identity-reveal-button')).toBeInTheDocument();
      });
    });
  });

  describe('when the SSN value is encrypted', () => {
    const data = {
      [IdDI.ssn9]: {
        value: '',
        scrubbed: true,
      },
    };

    const requirement = getRequirement({
      populatedAttributes: [CollectedKycDataOption.ssn9],
    });

    it('the Edit button should be present', async () => {
      const initialContext = getInitialContext({ requirement, data });
      renderIdentitySection(initialContext);

      const editButton = screen.getByTestId('identity-edit-button');
      expect(editButton).toBeInTheDocument();
    });

    it('the SSN should be hidden', async () => {
      const initialContext = getInitialContext({ requirement, data });
      renderIdentitySection(initialContext);

      await waitFor(() => {
        expect(screen.getByText('•'.repeat(9))).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId('identity-reveal-button')).toBeInTheDocument();
      });
    });

    it('the SSN should be decrypted then revealed when Reveal is clicked', async () => {
      const initialContext = getInitialContext({ requirement, data });
      renderIdentitySection(initialContext);
      withDecryptUser('123456789');

      await waitFor(() => {
        const revealButton = screen.getByTestId('identity-reveal-button');
        expect(revealButton).toBeInTheDocument();
      });
      const revealButton = screen.getByTestId('identity-reveal-button');
      await userEvent.click(revealButton);

      await waitFor(() => {
        expect(mockGenerateBiometricResponseImpl).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('123-45-6789')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId('identity-hide-button')).toBeInTheDocument();
      });
    });

    it('the Reveal and Hide buttons should not be present when editing', async () => {
      const initialContext = getInitialContext({ requirement, data });
      renderIdentitySection(initialContext);

      const editButton = screen.getByTestId('identity-edit-button');
      await userEvent.click(editButton);

      expect(screen.queryByTestId('identity-reveal-button')).toBeNull();
      expect(screen.queryByTestId('identity-hide-button')).toBeNull();
    });
  });

  describe('when SSN is optional and the user does not provide one', () => {
    const requirement = getRequirement({
      optionalAttributes: [CollectedKycDataOption.ssn4],
    });

    it('the Edit button shuold be present', async () => {
      const initialContext = getInitialContext({ requirement });
      renderIdentitySection(initialContext);

      const editButton = screen.getByTestId('identity-edit-button');
      expect(editButton).toBeInTheDocument();
    });

    it('no Reveal or Hide button should be present', async () => {
      const initialContext = getInitialContext({ requirement });
      renderIdentitySection(initialContext);

      expect(screen.queryByTestId('identity-reveal-button')).toBeNull();
      expect(screen.queryByTestId('identity-hide-button')).toBeNull();
    });

    it('the Reveal and Hide buttons should not be present when editing', async () => {
      const initialContext = getInitialContext({ requirement });
      renderIdentitySection(initialContext);

      const editButton = screen.getByTestId('identity-edit-button');
      await userEvent.click(editButton);

      expect(screen.queryByTestId('identity-reveal-button')).toBeNull();
      expect(screen.queryByTestId('identity-hide-button')).toBeNull();
    });

    it('SSN should be hidden after being edited', async () => {
      const initialContext = getInitialContext({ requirement });
      renderIdentitySection(initialContext);
      withUserVault();

      const editButton = screen.getByTestId('identity-edit-button');
      await userEvent.click(editButton);

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
      });
      const input = screen.getByRole('textbox');
      await userEvent.type(input, '4321');

      await waitFor(() => {
        const saveButton = screen.getByTestId('ssn-save-edit-button');
        expect(saveButton).toBeInTheDocument();
      });
      const saveButton = screen.getByTestId('ssn-save-edit-button');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('•'.repeat(4))).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId('identity-reveal-button')).toBeInTheDocument();
      });
    });
  });

  it('when the device does not have support for webauthn, there are no Reveal or Hide buttons', () => {
    const device = {
      type: 'mobile',
      hasSupportForWebauthn: false,
      osName: 'iOS',
      browser: 'Mobile Safari',
    };
    const initialContext = getInitialContext({ device });
    renderIdentitySection(initialContext);

    expect(screen.queryByTestId('identity-reveal-button')).toBeNull();
    expect(screen.queryByTestId('identity-hide-button')).toBeNull();
  });

  it('when there is no SSN requirement, the Identity Section is not rendered', () => {
    const requirement = getRequirement();
    const initialContext = getInitialContext({ requirement });
    renderIdentitySection(initialContext);

    expect(screen.queryByTestId('identity-section')).not.toBeInTheDocument();
  });
});

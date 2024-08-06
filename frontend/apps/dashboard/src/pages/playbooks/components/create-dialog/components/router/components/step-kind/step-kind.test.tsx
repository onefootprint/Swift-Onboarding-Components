import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { asAdminUserWithOrg } from 'src/config/tests';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

import type { StepKindProps } from './step-kind';
import WhoToOnboard from './step-kind';

const renderWhoToOnboard = ({ onSubmit }: StepKindProps) => customRender(<WhoToOnboard onSubmit={onSubmit} />);

describe('<WhoToOnboard />', () => {
  beforeEach(() => {
    asAdminUserWithOrg({
      isLive: false,
      isProdKybPlaybookRestricted: true,
      isProdKycPlaybookRestricted: true,
    });
  });
  it('should submit KYC correctly', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit });
    const option = screen.getByText('Onboard people');
    await userEvent.click(option);
    const submit = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith({ kind: PlaybookKind.Kyc });
  });

  it('should submit KYB correctly', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit });
    const option = screen.getByText('Onboard businesses and their beneficial owners');
    await userEvent.click(option);
    const submit = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith({ kind: PlaybookKind.Kyb });
  });

  it('should have next but no back button', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit });
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  describe('when in sandbox', () => {
    it('all options should be enabled', async () => {
      asAdminUserWithOrg({
        isLive: false,
        isProdKybPlaybookRestricted: true,
        isProdKycPlaybookRestricted: true,
      });

      const onSubmit = jest.fn();
      renderWhoToOnboard({ onSubmit });

      expect(screen.getByText('Onboard people')).not.toHaveAttribute('disabled');
      expect(screen.getByText('Onboard businesses and their beneficial owners')).not.toHaveAttribute('disabled');
    });
  });

  describe('when in live mode', () => {
    it('KYB disabled when KYB restricted', async () => {
      asAdminUserWithOrg({
        isLive: true,
        isProdKybPlaybookRestricted: true,
        isProdKycPlaybookRestricted: false,
      });

      const onSubmit = jest.fn();
      renderWhoToOnboard({ onSubmit });

      const kycOption = screen.getByRole('button', { name: 'Onboard people' });
      expect(kycOption).not.toHaveAttribute('disabled');

      const kybOption = screen.getByRole('button', {
        name: 'Onboard businesses and their beneficial owners',
      });
      expect(kybOption).toHaveAttribute('disabled');
    });

    it('both disabled when both restricted', async () => {
      asAdminUserWithOrg({
        isLive: true,
        isProdKybPlaybookRestricted: true,
        isProdKycPlaybookRestricted: true,
      });

      const onSubmit = jest.fn();
      renderWhoToOnboard({ onSubmit });

      const kycOption = screen.getByRole('button', { name: 'Onboard people' });
      expect(kycOption).toHaveAttribute('disabled');

      const kybOption = screen.getByRole('button', {
        name: 'Onboard businesses and their beneficial owners',
      });
      expect(kybOption).toHaveAttribute('disabled');
    });

    it('both enabled when no restrictions', async () => {
      asAdminUserWithOrg({
        isLive: true,
        isProdKybPlaybookRestricted: false,
        isProdKycPlaybookRestricted: false,
      });

      const onSubmit = jest.fn();
      renderWhoToOnboard({ onSubmit });

      expect(screen.getByText('Onboard people')).not.toHaveAttribute('disabled');
      expect(screen.getByText('Onboard businesses and their beneficial owners')).not.toHaveAttribute('disabled');
    });
  });
});

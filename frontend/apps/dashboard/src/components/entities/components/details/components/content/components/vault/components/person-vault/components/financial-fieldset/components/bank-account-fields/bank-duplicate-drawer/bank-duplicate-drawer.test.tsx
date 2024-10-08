import { customRender, screen } from '@onefootprint/test-utils';
import type { VaultValue } from '@onefootprint/types';
import BankDuplicateDrawer from './bank-duplicate-drawer';
import {
  allMatchingDupesFixture,
  mixedDupesFixture,
  nonMatchingDupesFixture,
} from './bank-duplicate-drawer.test.config';

describe('<BankDuplicateDrawer />', () => {
  const defaultProps = {
    isOpen: true,
    isLoading: false,
    onClose: jest.fn(),
    fingerprint: 'fingerprint1' as VaultValue,
  };

  it('should show correct title and subtitle', () => {
    customRender(<BankDuplicateDrawer {...defaultProps} dupes={allMatchingDupesFixture} />);
    const title = screen.getByText('Duplicate bank accounts');
    expect(title).toBeInTheDocument();
    const subtitle = screen.getByText('Users with this bank account in common:');
    expect(subtitle).toBeInTheDocument();
  });

  it('should show three shimmers when isLoading is true', () => {
    customRender(<BankDuplicateDrawer {...defaultProps} isLoading={true} dupes={allMatchingDupesFixture} />);
    const progressbars = screen.getAllByRole('progressbar');
    expect(progressbars).toHaveLength(3);
  });

  it('should show all dupes when all fingerprints are the same as the one passed in', () => {
    customRender(<BankDuplicateDrawer {...defaultProps} dupes={allMatchingDupesFixture} />);
    const firstDupe = screen.getByText('fp_id_1');
    expect(firstDupe).toBeInTheDocument();
    const secondDupe = screen.getByText('fp_id_2');
    expect(secondDupe).toBeInTheDocument();
    const thirdDupe = screen.getByText('fp_id_3');
    expect(thirdDupe).toBeInTheDocument();
  });

  it('should show only matching dupes when some fingerprints match', () => {
    customRender(<BankDuplicateDrawer {...defaultProps} dupes={mixedDupesFixture} />);
    const firstDupe = screen.getByText('fp_id_1');
    expect(firstDupe).toBeInTheDocument();
    const secondDupe = screen.getByText('fp_id_2');
    expect(secondDupe).toBeInTheDocument();
    const thirdDupe = screen.queryByText('fp_id_3');
    expect(thirdDupe).not.toBeInTheDocument();
  });

  it('should show no dupes when no fingerprints match', () => {
    customRender(<BankDuplicateDrawer {...defaultProps} dupes={nonMatchingDupesFixture} />);
    const firstDupe = screen.queryByText('fp_id_1');
    expect(firstDupe).not.toBeInTheDocument();
    const secondDupe = screen.queryByText('fp_id_2');
    expect(secondDupe).not.toBeInTheDocument();
    const thirdDupe = screen.queryByText('fp_id_3');
    expect(thirdDupe).not.toBeInTheDocument();
  });

  it('should show nothing when there are no dupes', () => {
    customRender(<BankDuplicateDrawer {...defaultProps} dupes={[]} />);
    const firstDupe = screen.queryByText('fp_id_1');
    expect(firstDupe).not.toBeInTheDocument();
    const secondDupe = screen.queryByText('fp_id_2');
    expect(secondDupe).not.toBeInTheDocument();
    const thirdDupe = screen.queryByText('fp_id_3');
    expect(thirdDupe).not.toBeInTheDocument();
  });
});

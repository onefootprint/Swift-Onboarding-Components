import { customRender, screen } from '@onefootprint/test-utils';
import type { VaultValue } from '@onefootprint/types';
import CardDuplicateDrawer from './card-duplicate-drawer';
import {
  allMatchingDupesFixture,
  mixedDupesFixture,
  nonMatchingDupesFixture,
} from './card-duplicate-drawer.test.config';

describe('<DuplicateDataDrawer />', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    isCard: true,
    fingerprint: 'fingerprint1' as VaultValue,
  };

  it('should show all dupes when all fingerprints are the same as the one passed in', () => {
    customRender(<CardDuplicateDrawer {...defaultProps} dupes={allMatchingDupesFixture} />);
    const firstDupe = screen.getByText('fp_id_1');
    expect(firstDupe).toBeInTheDocument();
    const secondDupe = screen.getByText('fp_id_2');
    expect(secondDupe).toBeInTheDocument();
    const thirdDupe = screen.getByText('fp_id_3');
    expect(thirdDupe).toBeInTheDocument();
  });

  it('should show only matching dupes when some fingerprints match', () => {
    customRender(<CardDuplicateDrawer {...defaultProps} dupes={mixedDupesFixture} />);
    const firstDupe = screen.getByText('fp_id_1');
    expect(firstDupe).toBeInTheDocument();
    const secondDupe = screen.getByText('fp_id_2');
    expect(secondDupe).toBeInTheDocument();
    const thirdDupe = screen.queryByText('fp_id_3');
    expect(thirdDupe).not.toBeInTheDocument();
  });

  it('should show no dupes when no fingerprints match', () => {
    customRender(<CardDuplicateDrawer {...defaultProps} dupes={nonMatchingDupesFixture} />);
    const firstDupe = screen.queryByText('fp_id_1');
    expect(firstDupe).not.toBeInTheDocument();
    const secondDupe = screen.queryByText('fp_id_2');
    expect(secondDupe).not.toBeInTheDocument();
    const thirdDupe = screen.queryByText('fp_id_3');
    expect(thirdDupe).not.toBeInTheDocument();
  });

  it('should show nothing when there are no dupes', () => {
    customRender(<CardDuplicateDrawer {...defaultProps} dupes={[]} />);
    const firstDupe = screen.queryByText('fp_id_1');
    expect(firstDupe).not.toBeInTheDocument();
    const secondDupe = screen.queryByText('fp_id_2');
    expect(secondDupe).not.toBeInTheDocument();
    const thirdDupe = screen.queryByText('fp_id_3');
    expect(thirdDupe).not.toBeInTheDocument();
  });
});

import themes from '@onefootprint/design-tokens';
import { customRender, screen } from '@onefootprint/test-utils';
import { SentilinkScoreBand } from '@onefootprint/types';
import Score from './score';
import { reasonCodesFixture } from './score.test.config';

const renderScore = (props = {}) => {
  const defaultProps = {
    score: 400,
    scoreBand: SentilinkScoreBand.high,
    reasonCodes: reasonCodesFixture,
    title: 'Synthetic score',
  };
  return customRender(<Score {...defaultProps} {...props} />);
};

describe('<Score />', () => {
  it('renders the score label correctly', () => {
    renderScore();
    const labelElement = screen.getByText('Synthetic score');
    expect(labelElement).toBeInTheDocument();
  });

  it('displays the score value', () => {
    renderScore();
    const scoreElement = screen.getByText('400');
    expect(scoreElement).toBeInTheDocument();
  });

  describe('Score color based on scoreBand', () => {
    it('applies success color for low scoreBand', () => {
      renderScore({ scoreBand: SentilinkScoreBand.low });
      const scoreElement = screen.getByText('400');
      expect(scoreElement).toHaveStyle(`color: ${themes.light.color.success}`);
    });

    it('applies warning color for medium scoreBand', () => {
      renderScore({ scoreBand: SentilinkScoreBand.medium });
      const scoreElement = screen.getByText('400');
      expect(scoreElement).toHaveStyle(`color: ${themes.light.color.warning}`);
    });

    it('applies error color for high scoreBand', () => {
      renderScore({ scoreBand: SentilinkScoreBand.high });
      const scoreElement = screen.getByText('400');
      expect(scoreElement).toHaveStyle(`color: ${themes.light.color.error}`);
    });
  });
});

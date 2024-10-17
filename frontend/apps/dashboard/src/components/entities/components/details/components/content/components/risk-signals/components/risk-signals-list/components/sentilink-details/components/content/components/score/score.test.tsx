import themes from '@onefootprint/design-tokens';
import { customRender, screen } from '@onefootprint/test-utils';
import { SentilinkScoreBand } from '@onefootprint/types';
import Score from './score';
import {
  lessFraudyReasonCodesFixture,
  mixedReasonCodesFixture,
  moreFraudyReasonCodesFixture,
  reasonCodesFixture,
} from './score.test.config';

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

  it('shows both "Less fraudy" and "More fraudy" risk indicators when there are signals of both', () => {
    renderScore({ reasonCodes: mixedReasonCodesFixture, title: 'Mixed score' });

    const lessFraudyIndicator = screen.getByText('Less fraudy');
    expect(lessFraudyIndicator).toBeInTheDocument();
    const moreFraudyIndicator = screen.getByText('More fraudy');
    expect(moreFraudyIndicator).toBeInTheDocument();
  });

  it('shows only "Less fraudy" risk indicator when there are no more fraudy signals', () => {
    renderScore({ reasonCodes: lessFraudyReasonCodesFixture, title: 'Less fraudy score' });

    const lessFraudyIndicator = screen.getByText('Less fraudy');
    expect(lessFraudyIndicator).toBeInTheDocument();
    const moreFraudyIndicator = screen.queryByText('More fraudy');
    expect(moreFraudyIndicator).not.toBeInTheDocument();
  });

  it('shows only "More fraudy" risk indicator when there are no less fraudy signals', () => {
    renderScore({ score: 600, reasonCodes: moreFraudyReasonCodesFixture, title: 'More fraudy score' });

    const lessFraudyIndicator = screen.queryByText('Less fraudy');
    expect(lessFraudyIndicator).not.toBeInTheDocument();
    const moreFraudyIndicator = screen.getByText('More fraudy');
    expect(moreFraudyIndicator).toBeInTheDocument();
  });

  it('shows neither risk indicator when there are no reason codes', () => {
    renderScore({ score: 500, reasonCodes: [], title: 'No signals score' });

    const lessFraudyIndicator = screen.queryByText('Less fraudy');
    expect(lessFraudyIndicator).not.toBeInTheDocument();
    const moreFraudyIndicator = screen.queryByText('More fraudy');
    expect(moreFraudyIndicator).not.toBeInTheDocument();
  });
});

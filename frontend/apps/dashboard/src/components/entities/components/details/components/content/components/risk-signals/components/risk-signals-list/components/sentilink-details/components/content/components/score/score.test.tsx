import themes from '@onefootprint/design-tokens';
import { customRender, screen } from '@onefootprint/test-utils';
import Score from './score';
import {
  lessFraudyReasonCodesFixture,
  mixedReasonCodesFixture,
  moreFraudyReasonCodesFixture,
  reasonCodesFixture,
} from './score.test.config';

describe('<Score />', () => {
  it('renders the score label correctly', () => {
    customRender(<Score score={400} reasonCodes={reasonCodesFixture} title="Synthetic score" />);
    const labelElement = screen.getByText('Synthetic score');
    expect(labelElement).toBeInTheDocument();
  });

  it('displays the score value', () => {
    customRender(<Score score={400} reasonCodes={reasonCodesFixture} title="Synthetic score" />);
    const scoreElement = screen.getByText('400');
    expect(scoreElement).toBeInTheDocument();
  });

  it('applies success color for score below 500', () => {
    customRender(<Score score={400} reasonCodes={reasonCodesFixture} title="Synthetic score" />);
    const scoreElement = screen.getByText('400');
    expect(scoreElement).toHaveStyle(`color: ${themes.light.color.success}`);
  });

  it('applies error color for score 500 and above', () => {
    customRender(<Score score={500} reasonCodes={reasonCodesFixture} title="Synthetic score" />);
    const scoreElement = screen.getByText('500');
    expect(scoreElement).toHaveStyle(`color: ${themes.light.color.error}`);
  });

  it('shows both "Less fraudy" and "More fraudy" risk indicators when there are signals of both', () => {
    customRender(<Score score={400} reasonCodes={mixedReasonCodesFixture} title="Mixed score" />);

    const lessFraudyIndicator = screen.getByText('Less fraudy');
    const moreFraudyIndicator = screen.getByText('More fraudy');

    expect(lessFraudyIndicator).toBeInTheDocument();
    expect(moreFraudyIndicator).toBeInTheDocument();
  });

  it('shows only "Less fraudy" risk indicator when there are no more fraudy signals', () => {
    customRender(<Score score={400} reasonCodes={lessFraudyReasonCodesFixture} title="Less fraudy score" />);

    const lessFraudyIndicator = screen.getByText('Less fraudy');
    const moreFraudyIndicator = screen.queryByText('More fraudy');

    expect(lessFraudyIndicator).toBeInTheDocument();
    expect(moreFraudyIndicator).not.toBeInTheDocument();
  });

  it('shows only "More fraudy" risk indicator when there are no less fraudy signals', () => {
    customRender(<Score score={600} reasonCodes={moreFraudyReasonCodesFixture} title="More fraudy score" />);

    const lessFraudyIndicator = screen.queryByText('Less fraudy');
    const moreFraudyIndicator = screen.getByText('More fraudy');

    expect(lessFraudyIndicator).not.toBeInTheDocument();
    expect(moreFraudyIndicator).toBeInTheDocument();
  });

  it('shows neither risk indicator when there are no reason codes', () => {
    customRender(<Score score={500} reasonCodes={[]} title="No signals score" />);

    const lessFraudyIndicator = screen.queryByText('Less fraudy');
    const moreFraudyIndicator = screen.queryByText('More fraudy');

    expect(lessFraudyIndicator).not.toBeInTheDocument();
    expect(moreFraudyIndicator).not.toBeInTheDocument();
  });
});

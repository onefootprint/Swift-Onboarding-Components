import themes from '@onefootprint/design-tokens';
import { customRender, screen } from '@onefootprint/test-utils';
import Score from './score';
import { reasonCodesFixture } from './score.test.config';

describe('<Score />', () => {
  it('renders the score label correctly', () => {
    customRender(<Score score={400} reasonCodes={reasonCodesFixture} />);
    const labelElement = screen.getByText('Score');
    expect(labelElement).toBeInTheDocument();
  });

  it('displays the score value', () => {
    customRender(<Score score={400} reasonCodes={reasonCodesFixture} />);
    const scoreElement = screen.getByText('400');
    expect(scoreElement).toBeInTheDocument();
  });

  it('applies success color for score below 500', () => {
    customRender(<Score score={400} reasonCodes={reasonCodesFixture} />);
    const scoreElement = screen.getByText('400');
    expect(scoreElement).toHaveStyle(`color: ${themes.light.color.success}`);
  });

  it('applies error color for score 500 and above', () => {
    customRender(<Score score={500} reasonCodes={reasonCodesFixture} />);
    const scoreElement = screen.getByText('500');
    expect(scoreElement).toHaveStyle(`color: ${themes.light.color.error}`);
  });
});

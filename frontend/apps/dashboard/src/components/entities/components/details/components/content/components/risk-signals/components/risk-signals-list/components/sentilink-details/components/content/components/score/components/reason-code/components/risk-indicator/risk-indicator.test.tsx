import themes from '@onefootprint/design-tokens';
import { customRender, screen } from '@onefootprint/test-utils';
import { SentilinkFraudLevel } from '@onefootprint/types';
import RiskIndicator from './risk-indicator';

describe('<RiskIndicator />', () => {
  it('correctly shows more fraudy', () => {
    customRender(<RiskIndicator fraudLevel={SentilinkFraudLevel.moreFraudy} />);

    const icon = screen.getByLabelText('Up arrow');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('fill', `${themes.light.color.error}`);

    const textElement = screen.getByText('More fraudy');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveStyle(`color: ${themes.light.color.error}`);
  });

  it('correctly shows less fraudy', () => {
    customRender(<RiskIndicator fraudLevel={SentilinkFraudLevel.lessFraudy} />);

    const icon = screen.getByLabelText('Down arrow');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('fill', `${themes.light.color.success}`);

    const textElement = screen.getByText('Less fraudy');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveStyle(`color: ${themes.light.color.success}`);
  });
});

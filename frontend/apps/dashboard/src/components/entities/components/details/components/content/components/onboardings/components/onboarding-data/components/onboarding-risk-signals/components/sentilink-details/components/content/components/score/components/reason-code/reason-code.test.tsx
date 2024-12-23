import { customRender, screen } from '@onefootprint/test-utils';
import ReasonCode from './reason-code';
import { reasonCodesFixture } from './reason-code.test.config';

describe('<ReasonCode />', () => {
  it('renders the reason code correctly', () => {
    customRender(<ReasonCode reasonCode={reasonCodesFixture} />);

    const codeElement = screen.getByText('ssn_tied_to_clump');
    expect(codeElement).toBeInTheDocument();

    const explanationElement = screen.getByText(
      'Whether the SSN is tied to a clump of SSNs empirically used for fraud',
    );
    expect(explanationElement).toBeInTheDocument();
    const riskIndicatorElement = screen.getByLabelText('Up arrow');
    expect(riskIndicatorElement).toBeInTheDocument();
  });
});

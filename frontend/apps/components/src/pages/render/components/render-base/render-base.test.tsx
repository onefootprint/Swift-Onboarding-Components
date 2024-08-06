import '../../../../config/initializers/react-i18next-test';

import { customRender, screen } from '@onefootprint/test-utils';

import type { RenderBaseProps } from './render-base';
import RenderBase from './render-base';

const CARD_VALUE = '4242424242424242';
const CARD_FORMATTED = '4242 4242 4242 4242';
const CARD_HIDDEN = '•••• •••• •••• ••••';

const CARD_AMEX_VALUE = '378282246310005';
const CARD_AMEX_FORMATTED = '3782 822463 10005';
const CARD_AMEX_HIDDEN = '•••• •••••• •••••';

const CARD_CVC_VALUE = '123';
const CARD_CVC_FORMATTED = '123';
const CARD_CVC_HIDDEN = '•••';

const CARD_EXP_DATE = '1223';
const CARD_EXP_DATE_FORMATTED = '12 / 23';
const CARD_EXP_DATE_HIDDEN = '•• / ••';

describe('<RenderBase />', () => {
  const renderRender = ({
    isHidden = false,
    label,
    mask = 'creditCard',
    onToggleHidden = jest.fn(),
    value = '4242424242424242',
    canCopy = false,
  }: Partial<RenderBaseProps>) =>
    customRender(
      <RenderBase
        isHidden={isHidden}
        label={label}
        mask={mask}
        onToggleHidden={onToggleHidden}
        value={value}
        canCopy={canCopy}
      />,
    );

  it('should render value', () => {
    renderRender({ value: CARD_CVC_VALUE, isHidden: false, mask: 'cvc' });
    const value = screen.getByText(CARD_CVC_VALUE);
    expect(value).toBeInTheDocument();
  });

  it('should render the label', () => {
    renderRender({ label: 'label', isHidden: false, mask: 'cvc' });
    const customLabel = screen.getByText('label');
    expect(customLabel).toBeInTheDocument();
  });

  it('should hide the card value when isHidden is true', () => {
    renderRender({
      isHidden: true,
      mask: 'creditCard',
      value: CARD_VALUE,
    });
    const hiddenValue = screen.getByText(CARD_HIDDEN);
    expect(hiddenValue).toBeInTheDocument();
  });

  it('should format the card value when isHidden is false', () => {
    renderRender({
      isHidden: false,
      mask: 'creditCard',
      value: CARD_VALUE,
    });
    const formattedValue = screen.getByText(CARD_FORMATTED);
    expect(formattedValue).toBeInTheDocument();
  });

  it('should format the amex card value when isHidden is false', () => {
    renderRender({
      isHidden: false,
      mask: 'creditCard',
      value: CARD_AMEX_VALUE,
    });
    const formattedValue = screen.getByText(CARD_AMEX_FORMATTED);
    expect(formattedValue).toBeInTheDocument();
  });

  it('should show the right hidden value when amex card is hidden', () => {
    renderRender({
      isHidden: true,
      mask: 'creditCard',
      value: CARD_AMEX_VALUE,
    });
    const hiddenValue = screen.getByText(CARD_AMEX_HIDDEN);
    expect(hiddenValue).toBeInTheDocument();
  });

  it('should format the cvc value when isHidden is false', () => {
    renderRender({
      isHidden: false,
      mask: 'cvc',
      value: CARD_CVC_VALUE,
    });
    const formattedValue = screen.getByText(CARD_CVC_FORMATTED);
    expect(formattedValue).toBeInTheDocument();
  });

  it('should hide the cvc value when isHidden is true', () => {
    renderRender({
      isHidden: true,
      mask: 'cvc',
      value: CARD_CVC_VALUE,
    });
    const hiddenValue = screen.getByText(CARD_CVC_HIDDEN);
    expect(hiddenValue).toBeInTheDocument();
  });

  it('should render the copy button', () => {
    renderRender({
      isHidden: false,
      mask: 'creditCard',
      value: CARD_VALUE,
      canCopy: true,
    });
    const copyButton = screen.getByRole('button');
    expect(copyButton).toBeInTheDocument();
  });

  it('should format the date value when isHidden is false', () => {
    renderRender({
      isHidden: false,
      mask: 'date',
      value: CARD_EXP_DATE,
    });
    const formattedValue = screen.getByText(CARD_EXP_DATE_FORMATTED);
    expect(formattedValue).toBeInTheDocument();
  });

  it('should hide the date value when isHidden is true', () => {
    renderRender({
      isHidden: true,
      mask: 'date',
      value: CARD_EXP_DATE,
    });
    const hiddenValue = screen.getByText(CARD_EXP_DATE_HIDDEN);
    expect(hiddenValue).toBeInTheDocument();
  });
});

import { IcoAndroid16, IcoApple16 } from '@onefootprint/icons';
import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import type { RadioSelectProps } from './radio-select';
import RadioSelect from './radio-select';

describe('<RadioSelect />', () => {
  const renderRadioSelect = ({
    value,
    testID,
    onChange = () => {},
  }: Partial<RadioSelectProps>) => {
    const options = [
      {
        title: 'Item 1',
        description: 'Description 1',
        IconComponent: IcoAndroid16,
        value: 'Item 1',
      },
      {
        title: 'Item 2',
        description: 'Description 2',
        IconComponent: IcoApple16,
        value: 'Item 2',
      },
    ];
    return customRender(
      <RadioSelect
        options={options}
        value={value}
        onChange={onChange}
        testID={testID}
      />,
    );
  };

  describe('<RadioSelect />', () => {
    it('should assign a testID', () => {
      renderRadioSelect({
        testID: 'radio-select-test-id',
      });
      expect(screen.getByTestId('radio-select-test-id')).toBeInTheDocument();
    });

    it('has selected option', () => {
      renderRadioSelect({
        value: 'Item 2',
      });
      const option = screen.getByLabelText('Item 2') as HTMLButtonElement;
      expect((option as any).selected).toBeTruthy();
    });

    describe('when clicking on an option', () => {
      it('should trigger onChange event', async () => {
        const onChangeMockFn = jest.fn();
        renderRadioSelect({
          onChange: onChangeMockFn,
        });
        const option = screen.getByLabelText('Item 2') as HTMLButtonElement;
        await userEvent.click(option);
        expect(onChangeMockFn).toHaveBeenCalled();
      });
    });
  });
});

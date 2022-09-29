import { IcoAndroidColored16, IcoAppleColored16 } from '@onefootprint/icons';
import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import RadioSelect, { RadioSelectProps } from './radio-select';

describe('<RadioSelect />', () => {
  const renderRadioSelect = ({
    defaultSelected,
    testID,
    onSelect = () => {},
  }: Partial<RadioSelectProps>) => {
    const options = [
      {
        title: 'Item 1',
        description: 'Description 1',
        IconComponent: IcoAndroidColored16,
        value: 'Item 1',
      },
      {
        title: 'Item 2',
        description: 'Description 2',
        IconComponent: IcoAppleColored16,
        value: 'Item 2',
      },
    ];
    return customRender(
      <RadioSelect
        options={options}
        defaultSelected={defaultSelected}
        onSelect={onSelect}
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
        defaultSelected: 'Item 2',
      });
      const option = screen.getByLabelText(
        'Description 2',
      ) as HTMLButtonElement;
      expect((option as any).selected).toBeTruthy();
    });

    it('should have the first option selected by default', () => {
      renderRadioSelect({});
      const option = screen.getByLabelText(
        'Description 1',
      ) as HTMLButtonElement;
      expect((option as any).selected).toBeTruthy();
    });

    describe('when clicking on an option', () => {
      it('should trigger onSelect event', async () => {
        const onSelectMockFn = jest.fn();
        renderRadioSelect({
          onSelect: onSelectMockFn,
        });
        const option = screen.getByLabelText(
          'Description 2',
        ) as HTMLButtonElement;
        await userEvent.click(option);
        expect(onSelectMockFn).toHaveBeenCalled();
      });
    });
  });
});

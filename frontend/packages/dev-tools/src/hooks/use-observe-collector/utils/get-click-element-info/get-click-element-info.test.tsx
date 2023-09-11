import { COUNTRIES } from '@onefootprint/global-constants';
import {
  customRender,
  screen,
  selectEvents,
  within,
} from '@onefootprint/test-utils';
import type { CountrySelectProps } from '@onefootprint/ui';
import { CountrySelect, Select, TextInput, Typography } from '@onefootprint/ui';
import React from 'react';

import { getClickedElementInfo } from './get-click-element-info';
import {
  MAX_INNER_TEXT_LENGTH,
  REDACTED_PRIVATE_DATA_VALUE,
  UNNAMED_ELEMENT_VALUE,
} from './get-click-element-info.constants';

describe('getClickElementInfo', () => {
  describe('with TextInput', () => {
    const renderElement = (value?: string) => {
      customRender(
        <TextInput
          testID="text-input"
          placeholder=""
          label="Normal Field"
          value={value}
        />,
      );
    };

    const renderElementWithPrivateData = () => {
      customRender(
        <TextInput
          testID="text-input"
          placeholder=""
          data-private
          label="SSN"
          value="999999999"
        />,
      );
    };

    const renderElementWithPrivateParent = () => {
      customRender(
        <div data-private="true" data-testid="parent">
          <TextInput
            testID="text-input"
            placeholder=""
            label="SSN"
            value="999999999"
          />
        </div>,
      );
    };

    const renderElementWithPrivateGrandparent = () => {
      customRender(
        <div data-private="true" data-testid="parent">
          <div>
            <TextInput
              testID="text-input"
              placeholder=""
              label="SSN"
              value="999999999"
            />
          </div>
        </div>,
      );
    };

    it('should redact data if any parent elem is marked as private', () => {
      renderElementWithPrivateParent();
      const input = screen.getByTestId('parent');
      const info = getClickedElementInfo(input);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('DIV');
    });

    it('should redact data if any indirect parent elem is marked as private', () => {
      renderElementWithPrivateGrandparent();
      const input = screen.getByTestId('parent');
      const info = getClickedElementInfo(input);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('DIV');
    });

    it('should get innerText of clicked element', () => {
      const value = '00000000';
      renderElement(value);

      const input = screen.getByTestId('text-input');
      const info = getClickedElementInfo(input);
      expect(info.name).toEqual(value);
      expect(info.tag).toEqual('INPUT');
    });

    it('should get redacted data from elements containing private data', () => {
      renderElementWithPrivateData();

      const input = screen.getByTestId('text-input');
      const info = getClickedElementInfo(input);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('INPUT');
    });

    it('clips the innerText if too long', () => {
      // Create a string longer than the allowed length
      renderElement(
        Array(MAX_INNER_TEXT_LENGTH + 1)
          .fill('0')
          .join(''),
      );

      const input = screen.getByTestId('text-input');
      const info = getClickedElementInfo(input);
      expect(info.name).toEqual(
        Array(MAX_INNER_TEXT_LENGTH).fill('0').join(''),
      );
      expect(info.tag).toEqual('INPUT');
    });

    it('adds a default value if element has no text', () => {
      renderElement();

      const input = screen.getByTestId('text-input');
      const info = getClickedElementInfo(input);
      expect(info.name).toEqual(UNNAMED_ELEMENT_VALUE);
      expect(info.tag).toEqual('INPUT');
    });
  });

  describe('with Typography', () => {
    const renderTypography = (isPrivate?: boolean) => {
      customRender(
        <Typography variant="body-1" isPrivate={isPrivate} testID="typography">
          Hello
        </Typography>,
      );
    };

    const renderTypographyWithParent = (isPrivate?: boolean) => {
      customRender(
        <div data-private={isPrivate ? 'true' : undefined} data-testid="parent">
          <Typography variant="body-1">Hello</Typography>
        </div>,
      );
    };

    it('should redact data if any parent elem is marked as private', () => {
      renderTypographyWithParent(true);
      const input = screen.getByTestId('parent');
      const info = getClickedElementInfo(input);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('DIV');
    });

    it('should redact data if marked as private', () => {
      renderTypography(true);

      let input = screen.getByTestId('typography');
      let info = getClickedElementInfo(input);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('P');

      input = screen.getByText('Hello');
      info = getClickedElementInfo(input);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('P');
    });

    it('should get text in typography if not private', () => {
      renderTypography();

      let input = screen.getByTestId('typography');
      let info = getClickedElementInfo(input);
      expect(info.name).toEqual('Hello');
      expect(info.tag).toEqual('P');

      input = screen.getByText('Hello');
      info = getClickedElementInfo(input);
      expect(info.name).toEqual('Hello');
      expect(info.tag).toEqual('P');
    });
  });

  describe('with Select', () => {
    const SelectOptions = [{ value: 'option 1', label: 'option 1' }];

    const renderSelect = (isPrivate?: boolean) =>
      customRender(
        <Select
          isPrivate={isPrivate}
          id="some id"
          label="label"
          options={SelectOptions}
          placeholder="Select"
          testID="select-test-id"
        />,
      );

    it('should get redacted data from private select trigger', async () => {
      renderSelect(true);
      const trigger = screen.getByRole('button', { name: 'Select' });
      const info = getClickedElementInfo(trigger);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('BUTTON');
    });

    it('should get redacted data from private select options', async () => {
      renderSelect(true);
      const trigger = screen.getByRole('button', { name: 'Select' });
      await selectEvents.openMenu(trigger);
      const option = screen.getByRole('option', {
        name: 'option 1',
      });
      const info = getClickedElementInfo(option);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('DIV');
    });
  });

  describe('with CountrySelect', () => {
    const renderCountrySelect = ({
      disabled,
      emptyStateText,
      hasError,
      hint,
      id = 'some id',
      label = 'label text',
      onChange = jest.fn(),
      placeholder = 'Select',
      searchPlaceholder,
      testID = 'select-test-id',
      value,
    }: Partial<CountrySelectProps>) =>
      customRender(
        <CountrySelect
          disabled={disabled}
          emptyStateText={emptyStateText}
          hasError={hasError}
          hint={hint}
          id={id}
          label={label}
          onChange={onChange}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          testID={testID}
          value={value}
        />,
      );

    it('when clicking on select trigger', async () => {
      renderCountrySelect({ options: COUNTRIES });
      const trigger = screen.getByRole('button', { name: 'Select' });
      const info = getClickedElementInfo(trigger);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('BUTTON');
      expect(info.otherNames).toEqual([]);
    });

    it('when clicking on select options', async () => {
      const onChange = jest.fn();
      renderCountrySelect({ options: COUNTRIES, onChange });
      const trigger = screen.getByRole('button', { name: 'Select' });
      const select = await selectEvents.openMenu(trigger);
      const option = within(select).getByRole('option', {
        name: 'United States of America',
      });
      const info = getClickedElementInfo(option);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('DIV');
    });
  });

  describe('with generic div/span', () => {
    const renderElementWithPrivateData = (value: string) => {
      customRender(
        <div data-testid="test-id" data-private>
          {value}
        </div>,
      );
    };

    it('should get redacted data from elements containing private data', () => {
      const value = '9999999999';
      renderElementWithPrivateData(value);

      const elem = screen.getByTestId('test-id');
      const info = getClickedElementInfo(elem);
      expect(info.name).toEqual(REDACTED_PRIVATE_DATA_VALUE);
      expect(info.tag).toEqual('DIV');
    });
  });
});

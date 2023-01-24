import { customRender, screen } from '@onefootprint/test-utils';
import { TextInput } from '@onefootprint/ui';
import React from 'react';

import getClickedElementInfo from './get-click-element-info';
import {
  MAX_INNER_TEXT_LENGTH,
  REDACTED_PRIVATE_DATA_VALUE,
  UNNAMED_ELEMENT_VALUE,
} from './get-click-element-info.constants';

describe('getClickElementInfo', () => {
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
    expect(info.name).toEqual(Array(MAX_INNER_TEXT_LENGTH).fill('0').join(''));
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

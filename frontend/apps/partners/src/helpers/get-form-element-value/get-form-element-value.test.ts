import { describe, expect, it } from 'bun:test';
import type { FormEvent } from 'react';

import getFormElementValue from './get-form-element-value';

describe('getFormElementValue', () => {
  it('should return an empty string if the element value is null', () => {
    const selector = 'input[name="test"]';
    const event = {
      target: document.createElement('form'),
    } as unknown as FormEvent<HTMLFormElement>;

    const result = getFormElementValue(selector)(event);
    expect(result).toEqual('');
  });

  it('should return the trimmed value of the element', () => {
    const selector = 'input[name="test"]';
    const value = '  test value  ';
    const input = document.createElement('input');
    input.name = 'test';
    input.value = value;
    const form = document.createElement('form');
    form.appendChild(input);
    const event = { target: form } as unknown as FormEvent<HTMLFormElement>;

    const result = getFormElementValue(selector)(event);
    expect(result).toEqual(value.trim());
  });
});

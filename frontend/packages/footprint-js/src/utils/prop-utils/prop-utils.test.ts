import { describe, expect, mock, test } from 'bun:test';

import type { Variant, VerifyButtonProps } from '../../types/components';
import { ComponentKind } from '../../types/components';
import {
  getBootstrapData,
  getCallbackProps,
  getDefaultVariantForKind,
  transformVerifyButtonProps,
  validateComponentKind,
  validateComponentVariant,
} from './prop-utils';

const noop = () => undefined;

describe('getCallbackProps', () => {
  test('should call every possible callbacks for kind Auth', () => {
    const onDestroy = mock(noop);
    const onCancel = mock(noop);
    const onClose = mock(noop);
    const onComplete = mock(noop);
    const result = getCallbackProps(
      {
        kind: ComponentKind.Auth,
        publicKey: 'publicKey',
        onCancel,
        onClose,
        onComplete,
      },
      onDestroy,
    );
    expect(result).toMatchObject({
      canceled: Function,
      closed: Function,
      completed: Function,
    });

    result.closed?.();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDestroy).toHaveBeenCalledTimes(1);

    result.canceled?.();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDestroy).toHaveBeenCalledTimes(2);

    result.completed?.('token');
    expect(onComplete).toHaveBeenNthCalledWith(1, 'token');
  });

  test('should transform verify button into verify and call onLaunchChild', () => {
    const onDestroy = mock(noop);
    const onLaunchChild = mock(noop);
    const onCancel = mock(noop);
    const onClose = mock(noop);
    const onComplete = mock(noop);
    const onClick = mock(noop);
    const result = getCallbackProps(
      {
        kind: ComponentKind.VerifyButton,
        onCancel,
        onClick,
        onClose,
        onComplete,
        dialogVariant: 'modal',
        variant: 'inline',
        label: 'Veriy with Footprint',
        containerId: 'myElement',
        publicKey: 'publicKey',
      } as VerifyButtonProps,
      onDestroy,
      onLaunchChild,
    );

    expect(result).toMatchObject({
      canceled: Function,
      clicked: Function,
      closed: Function,
      completed: Function,
    });

    result.clicked?.('test-event');
    expect(onClick).toHaveBeenNthCalledWith(1, 'test-event');
    expect(onLaunchChild).toHaveBeenNthCalledWith(1, {
      kind: 'verify',
      onCancel,
      onClose,
      onComplete,
      publicKey: 'publicKey',
      variant: 'modal',
    });
  });
});

describe('getDefaultVariantForKind', () => {
  test.each([
    { kind: ComponentKind.Auth, x: 'modal' },
    { kind: ComponentKind.Form, x: 'inline' },
    { kind: ComponentKind.Render, x: 'inline' },
    { kind: ComponentKind.UpdateLoginMethods, x: 'modal' },
    { kind: ComponentKind.Verify, x: 'modal' },
    { kind: ComponentKind.VerifyButton, x: 'inline' },
  ])('.', ({ kind, x }) => {
    expect(getDefaultVariantForKind(kind)).toBe(x as Variant);
  });

  test('should throw an exception when an invalid kind is provided', () => {
    const fn = () => getDefaultVariantForKind('banana' as unknown as ComponentKind);
    expect(fn).toThrow('Invalid kind: banana');
  });
});

describe('validateComponentVariant', () => {
  test.each([
    { kind: ComponentKind.Auth, variant: '', x: undefined },
    { kind: ComponentKind.Auth, variant: 'drawer', x: undefined },
    { kind: ComponentKind.Auth, variant: 'modal', x: undefined },
    { kind: ComponentKind.Form, variant: '', x: undefined },
    { kind: ComponentKind.Form, variant: 'drawer', x: undefined },
    { kind: ComponentKind.Form, variant: 'inline', x: undefined },
    { kind: ComponentKind.Form, variant: 'modal', x: undefined },
    { kind: ComponentKind.Render, variant: '', x: undefined },
    { kind: ComponentKind.Render, variant: 'inline', x: undefined },
    { kind: ComponentKind.Verify, variant: '', x: undefined },
    { kind: ComponentKind.Verify, variant: 'drawer', x: undefined },
    { kind: ComponentKind.Verify, variant: 'modal', x: undefined },
    { kind: ComponentKind.VerifyButton, variant: '', x: undefined },
    { kind: ComponentKind.VerifyButton, variant: 'inline', x: undefined },
  ])('.', ({ kind, variant, x }) => {
    expect(validateComponentVariant(kind, variant as Variant)).toBe(x);
  });

  test('should throw an exception', () => {
    const fn = () => validateComponentVariant(ComponentKind.Verify, 'banana' as unknown as Variant);
    expect(fn).toThrow('Invalid variant: "banana". Valid variants for verify are modal, drawer');
  });
});

describe('validateComponentKind', () => {
  test.each([
    { kind: ComponentKind.Auth, x: undefined },
    { kind: ComponentKind.Form, x: undefined },
    { kind: ComponentKind.Render, x: undefined },
    { kind: ComponentKind.Verify, x: undefined },
    { kind: ComponentKind.VerifyButton, x: undefined },
  ])('.', ({ kind, x }) => {
    expect(validateComponentKind(kind)).toBe(x);
  });

  test('should throw an exception when an invalid kind is provided', () => {
    const fn1 = () => validateComponentKind(null as unknown as ComponentKind);
    expect(fn1).toThrow('Kind is required');

    const fn2 = () => validateComponentKind('banana' as unknown as ComponentKind);
    expect(fn2).toThrow(
      'Invalid kind: banana. Valid kinds are: auth, components, form, render, update_login_methods, verify, verify-button',
    );
  });
});

describe('transformVerifyButtonProps', () => {
  test('should be undefined when kind is not "verify-button"', () => {
    expect(
      transformVerifyButtonProps({
        kind: ComponentKind.Form,
        authToken: 'token',
      }),
    ).toBeUndefined();
    expect(
      transformVerifyButtonProps({
        kind: ComponentKind.Verify,
        publicKey: 'key',
      }),
    ).toBeUndefined();
    expect(
      transformVerifyButtonProps({
        kind: ComponentKind.Auth,
        publicKey: 'key',
      }),
    ).toBeUndefined();
  });

  test('should replace "verify-button" to "verify" and omit some properties', () => {
    expect(
      transformVerifyButtonProps({
        kind: ComponentKind.VerifyButton,
        containerId: 'containerId',
        publicKey: 'publicKey',
        variant: 'inline',
        dialogVariant: 'drawer',
      }),
    ).toEqual({
      kind: ComponentKind.Verify,
      publicKey: 'publicKey',
      variant: 'drawer',
    });
  });
});

describe('getBootstrapData', () => {
  test('should return userData when props has bootstrapData with keys', () => {
    const result = getBootstrapData({ bootstrapData: { key: 'value' } });
    expect(result).toEqual({ userData: { key: 'value' } });
  });

  test('should return userData when props has userData with keys', () => {
    const result = getBootstrapData({ userData: { key: 'value' } });
    expect(result).toEqual({ userData: { key: 'value' } });
  });

  test('should return undefined when props has neither bootstrapData nor userData', () => {
    const result = getBootstrapData({});
    expect(result).toBeUndefined();
  });

  test('should return undefined when both bootstrapData and userData are empty.', () => {
    // @ts-expect-error: banana is should not be in props
    const result = getBootstrapData({ bootstrapData: {}, userData: {}, banana: { a: 1 } });
    expect(result).toBeUndefined();
  });

  test('should prioritize bootstrapData', () => {
    const result = getBootstrapData({ bootstrapData: { key: 'value' }, userData: { key: 'value' } });
    expect(result).toEqual({ userData: { key: 'value' } });
  });

  test('should fallback to userData', () => {
    // @ts-expect-error: otherData is should not be in props
    const result = getBootstrapData({ bootstrapData: {}, otherData: { key: 'value' }, userData: { key: 'value' } });
    expect(result).toEqual({ userData: { key: 'value' } });
  });
});

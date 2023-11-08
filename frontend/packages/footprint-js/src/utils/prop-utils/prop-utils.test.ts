import type {
  AuthProps,
  Variant,
  VerifyButtonProps,
} from '../../types/components';
import { ComponentKind } from '../../types/components';
import {
  getCallbackProps,
  getDefaultVariantForKind,
  transformVerifyButtonProps,
  validateComponentKind,
  validateComponentVariant,
} from './prop-utils';

describe('getCallbackProps', () => {
  it('should call every possible callbacks for kind Auth', () => {
    const onDestroy = jest.fn();
    const onCancel = jest.fn();
    const onClose = jest.fn();
    const onComplete = jest.fn();
    const result = getCallbackProps(
      {
        kind: ComponentKind.Auth,
        publicKey: 'publicKey',
        onCancel,
        onClose,
        onComplete,
      } as AuthProps,
      onDestroy,
    );

    expect(result).toMatchObject({
      canceled: expect.any(Function),
      closed: expect.any(Function),
      completed: expect.any(Function),
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

  it('should transform verify button into verify and call onLaunchChild', () => {
    const onDestroy = jest.fn();
    const onLaunchChild = jest.fn();
    const onCancel = jest.fn();
    const onClose = jest.fn();
    const onComplete = jest.fn();
    const onClick = jest.fn();
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
      } as VerifyButtonProps,
      onDestroy,
      onLaunchChild,
    );

    expect(result).toMatchObject({
      canceled: expect.any(Function),
      clicked: expect.any(Function),
      closed: expect.any(Function),
      completed: expect.any(Function),
    });

    result.clicked?.('test-event');
    expect(onClick).toHaveBeenNthCalledWith(1, 'test-event');
    expect(onLaunchChild).toHaveBeenNthCalledWith(1, {
      kind: 'verify',
      onCancel,
      onClose,
      onComplete,
      variant: 'modal',
    });
  });
});

describe('getDefaultVariantForKind', () => {
  it.each`
    kind               | output
    ${'auth'}          | ${'modal'}
    ${'form'}          | ${'inline'}
    ${'render'}        | ${'inline'}
    ${'verify-button'} | ${'inline'}
    ${'verify'}        | ${'modal'}
  `(`should be $output for $kind`, ({ kind, output }) => {
    const result = getDefaultVariantForKind(kind);
    expect(result).toBe(output);
  });

  it('should throw an exception when an invalid kind is provided', () => {
    const fn = () =>
      getDefaultVariantForKind('banana' as unknown as ComponentKind);
    expect(fn).toThrow('Invalid kind: banana');
  });
});

describe('validateComponentVariant', () => {
  it.each`
    kind               | variant     | output
    ${'auth'}          | ${''}       | ${undefined}
    ${'auth'}          | ${'drawer'} | ${undefined}
    ${'auth'}          | ${'modal'}  | ${undefined}
    ${'form'}          | ${''}       | ${undefined}
    ${'form'}          | ${'drawer'} | ${undefined}
    ${'form'}          | ${'inline'} | ${undefined}
    ${'form'}          | ${'modal'}  | ${undefined}
    ${'render'}        | ${''}       | ${undefined}
    ${'render'}        | ${'inline'} | ${undefined}
    ${'verify-button'} | ${''}       | ${undefined}
    ${'verify-button'} | ${'inline'} | ${undefined}
    ${'verify'}        | ${''}       | ${undefined}
    ${'verify'}        | ${'drawer'} | ${undefined}
    ${'verify'}        | ${'modal'}  | ${undefined}
  `(`should work for $kind`, ({ kind, variant, output }) => {
    const result = validateComponentVariant(kind, variant);
    expect(result).toBe(output);
  });

  it('should throw an exception', () => {
    const fn = () =>
      validateComponentVariant(
        ComponentKind.Verify,
        'banana' as unknown as Variant,
      );
    expect(fn).toThrow(
      'Invalid variant: "banana". Valid variants for verify are modal, drawer',
    );
  });
});

describe('validateComponentKind', () => {
  it.each`
    kind               | output
    ${'auth'}          | ${undefined}
    ${'form'}          | ${undefined}
    ${'render'}        | ${undefined}
    ${'verify-button'} | ${undefined}
    ${'verify'}        | ${undefined}
  `(`should work for $kind`, ({ kind, output }) => {
    const result = validateComponentKind(kind);
    expect(result).toBe(output);
  });

  it('should throw an exception when an invalid kind is provided', () => {
    const fn1 = () => validateComponentKind(null as unknown as ComponentKind);
    expect(fn1).toThrow('Kind is required');

    const fn2 = () =>
      validateComponentKind('banana' as unknown as ComponentKind);
    expect(fn2).toThrow(
      'Invalid kind: banana. Valid kinds are: auth, form, render, verify, verify-button',
    );
  });
});

describe('transformVerifyButtonProps', () => {
  it('should be undefined when kind is not "verify-button"', () => {
    expect(
      transformVerifyButtonProps({
        kind: ComponentKind.Form,
        authToken: 'token',
      }),
    ).toEqual(undefined);
    expect(
      transformVerifyButtonProps({
        kind: ComponentKind.Verify,
        publicKey: 'key',
      }),
    ).toEqual(undefined);
    expect(
      transformVerifyButtonProps({
        kind: ComponentKind.Auth,
        publicKey: 'key',
      }),
    ).toEqual(undefined);
  });

  it('should replace "verify-button" to "verify" and omit some properties', () => {
    expect(
      transformVerifyButtonProps({
        kind: ComponentKind.VerifyButton,
        containerId: 'containerId',
        publicKey: 'publicKey',
        variant: 'inline',
        dialogVariant: 'drawer',
      }),
    ).toEqual({
      kind: 'verify',
      publicKey: 'publicKey',
      variant: 'drawer',
    });
  });
});

import {
  getCallbackFunction,
  getCallbackProps,
  getDefaultVariantForKind,
  getRefProps,
  omitCallbacksAndRefs,
  transformVerifyButtonProps,
  validateComponentKind,
  validateComponentVariant,
} from './prop-utils';

type Props = Parameters<typeof getCallbackProps>[0];

describe('getCallbackProps', () => {
  it('should call every possible callbacks for kind Auth', () => {
    const onDestroy = jest.fn(() => 'onDestroy');
    const onCancel = jest.fn(() => 'onCancel');
    const onClose = jest.fn(() => 'onClose');
    const onComplete = jest.fn(token => `onComplete-${token}`);
    const result = getCallbackProps(
      {
        kind: 'auth',
        onCancel,
        onClose,
        onComplete,
      } as unknown as Props,
      onDestroy,
      (...args: unknown[]) => 'onLaunchChild', // eslint-disable-line @typescript-eslint/no-unused-vars
    );

    expect(result).toMatchObject({
      canceled: expect.any(Function),
      closed: expect.any(Function),
      completed: expect.any(Function),
    });

    /* @ts-expect-error: number of arguments */
    result.closed('test-closed'); // onDestroy 1
    /* @ts-expect-error: number of arguments */
    result.canceled('test-cancelled'); // onDestroy 1
    /* @ts-expect-error: number of arguments */
    result.completed('test-token');

    expect(onDestroy).toHaveBeenCalledTimes(2);
    expect(onCancel).toHaveBeenNthCalledWith(1, 'test-cancelled');
    expect(onClose).toHaveBeenNthCalledWith(1, 'test-closed');
    expect(onComplete).toHaveBeenNthCalledWith(1, 'test-token');
  });

  it('should transform verify button into verify and call onLaunchChild', () => {
    const onDestroy = jest.fn(() => 'onDestroy');
    const onLaunchChild = jest.fn((...args: unknown[]) => 'onLaunchChild'); // eslint-disable-line @typescript-eslint/no-unused-vars
    const onCancel = jest.fn(() => 'onCancel');
    const onClose = jest.fn(() => 'onClose');
    const onComplete = jest.fn(token => `onComplete-${token}`);
    const onClick = jest.fn(event => `onClick-${event}`);
    const result = getCallbackProps(
      {
        kind: 'verify-button',
        onCancel,
        onClick,
        onClose,
        onComplete,
        dialogVariant: 'modal',
        appearance: { variant: 'ignored in onLaunchChild' },
        variant: 'ignored in onLaunchChild',
        label: 'ignored in onLaunchChild',
        containerId: 'ignored in onLaunchChild',
      } as unknown as Props,
      onDestroy,
      onLaunchChild,
    );

    expect(result).toMatchObject({
      canceled: expect.any(Function),
      clicked: expect.any(Function),
      closed: expect.any(Function),
      completed: expect.any(Function),
    });

    /* @ts-expect-error: possible undefined */
    result.clicked('test-event');

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

describe('getCallbackFunction', () => {
  it.each`
    obj                          | key          | output
    ${{ onClick: () => 'test' }} | ${'onClick'} | ${'test'}
    ${{ onClick: () => 'test' }} | ${'onOther'} | ${undefined}
    ${{ onClick: null }}         | ${'onClick'} | ${undefined}
    ${{ onClick: undefined }}    | ${'onClick'} | ${undefined}
  `(`should extract callback from the object`, ({ obj, key, output }) => {
    const fn = getCallbackFunction(obj, key);
    expect(fn()).toEqual(output);
  });

  it('should not accept properties from object prototype', () => {
    const rootObj = { onClick: () => 'possible prototype pollution' };
    const callbackFromRoot = getCallbackFunction(rootObj, 'onClick');
    expect(callbackFromRoot()).toEqual('possible prototype pollution');

    // @ts-expect-error: creating an object using other as prototype
    const pollutedObj = Object.create(rootObj, { onCancel: () => 'obj2' });
    const callbackFromPollutedObj = getCallbackFunction(pollutedObj, 'onClick');

    expect(pollutedObj.onClick()).toEqual('possible prototype pollution');
    expect(callbackFromPollutedObj()).toEqual(undefined);
  });
});

describe('getRefProps', () => {
  it.each`
    kind               | output
    ${'auth'}          | ${[]}
    ${'form'}          | ${['getRef']}
    ${'render'}        | ${[]}
    ${'verify-button'} | ${[]}
    ${'verify'}        | ${[]}
  `(`should be $output for $kind`, ({ kind, output }) => {
    // @ts-expect-error: types of arguments
    const result = getRefProps({ kind });
    expect(result).toEqual(output);
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
    // @ts-expect-error: types of arguments
    const fn = () => getDefaultVariantForKind('banana');
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
    // @ts-expect-error: types of arguments
    const fn = () => validateComponentVariant('verify', 'banana');
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
    // @ts-expect-error: null as argument
    const fn1 = () => validateComponentKind(null);
    expect(fn1).toThrow('Kind is required');

    // @ts-expect-error: banana as argument
    const fn2 = () => validateComponentKind('banana');
    expect(fn2).toThrow(
      'Invalid kind: banana. Valid kinds are: auth, form, render, verify, verify-button',
    );
  });
});

describe('transformVerifyButtonProps', () => {
  const PropsBase = {
    appearance: undefined,
    containerId: undefined,
    kind: 'kind',
    l10n: undefined,
    variant: undefined,
  };

  const FormProps = {
    authToken: 'string',
    containerId: undefined,
    getRef: undefined,
    kind: 'form',
    onCancel: undefined,
    onClose: undefined,
    onComplete: undefined,
    options: undefined,
    title: undefined,
    variant: undefined,
  };

  const VerifyProps = {
    kind: 'verify',
    onCancel: undefined,
    onClose: undefined,
    onComplete: undefined,
    options: undefined,
    publicKey: 'string',
    userData: undefined,
    variant: undefined,
  };

  const VerifyButtonProps = {
    containerId: 'string',
    dialogVariant: undefined,
    kind: 'verify-button',
    label: undefined,
    onCancel: undefined,
    onClick: undefined,
    onClose: undefined,
    onComplete: undefined,
    options: undefined,
    publicKey: undefined,
    userData: undefined,
    variant: 'inline',
  };

  const RenderProps = {
    authToken: 'string',
    canCopy: undefined,
    containerId: 'string',
    defaultHidden: undefined,
    id: 'string',
    kind: 'render',
    label: undefined,
    showHiddenToggle: undefined,
    variant: 'inline',
  };

  it('should be undefined when kind is not "verify-button"', () => {
    // @ts-expect-error: untyped arguments
    const result = transformVerifyButtonProps({
      ...PropsBase,
      ...FormProps,
      ...VerifyProps,
      ...VerifyButtonProps,
      ...RenderProps,
    });
    expect(result).toEqual(undefined);
  });

  it('should replace "verify-button" to "verify" and omit some properties', () => {
    // @ts-expect-error: untyped arguments
    const result = transformVerifyButtonProps({
      ...PropsBase,
      ...VerifyButtonProps,
    });
    expect(result).toEqual({
      kind: 'verify',
      l10n: undefined,
      onCancel: undefined,
      onClose: undefined,
      onComplete: undefined,
      options: undefined,
      publicKey: undefined,
      userData: undefined,
      variant: undefined,
    });
  });
});

describe('omitCallbacksAndRefs', () => {
  it('should throw an exception when an invalid kind is provided', () => {
    const onCancel = jest.fn(() => 'onCancel');
    const onClose = jest.fn(() => 'onClose');
    const onComplete = jest.fn(() => 'onComplete');
    const result = omitCallbacksAndRefs({
      kind: 'verify',
      containerId: 'containerId',
      appearance: {
        fontSrc: 'https://fonts...',
        variables: { linkColor: '#000000' },
        rules: {
          button: { transition: 'transform 0.1s ease' },
          'button:active': { transform: 'scale(0.96)' },
          linkButton: { textDecoration: 'underline' },
        },
      },
      onCancel,
      onClose,
      onComplete,
      options: { showCompletionPage: true, showLogo: true },
      publicKey: 'publicKey',
      userData: {},
      l10n: { locale: 'en-US' },
      variant: 'modal',
    } as unknown as Props);
    expect(result).toEqual({
      options: {
        showCompletionPage: true,
        showLogo: true,
      },
      publicKey: 'publicKey',
      userData: {},
      l10n: { locale: 'en-US' },
      variant: 'modal',
    });
  });
});

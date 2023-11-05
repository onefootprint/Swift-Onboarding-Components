import { registerCallbackProps, sendDataProps, setUpFormRefs } from './iframe';

type Child = Parameters<typeof registerCallbackProps>[0];
type Props = Parameters<typeof registerCallbackProps>[1];

function fakePostMate() {
  const refMap = {};
  return {
    on: (eventName: string, fn: (data?: unknown) => void) => {
      /* @ts-expect-error: string types */
      refMap[eventName] = fn;
    },
    call: (eventName: string, args?: unknown) => {
      /* @ts-expect-error: string types */
      refMap[eventName](args);
    },
  };
}

describe('registerCallbackProps', () => {
  it('should throw an exception when child is not provided', () => {
    // @ts-expect-error: types of arguments
    const fn = () => registerCallbackProps(undefined, undefined);
    expect(fn).toThrow(
      'Footprint should be initialized in order to listen events',
    );
  });

  it('should be able to register events to child reference', () => {
    const onCancel = jest.fn();
    const onClose = jest.fn();
    const onComplete = jest.fn();
    const onPropsReceived = jest.fn();
    const child = fakePostMate() as unknown as Child;
    const props = {
      kind: 'verify',
      onCancel,
      onClose,
      onComplete,
    } as unknown as Props;

    const childInstance = registerCallbackProps(
      child,
      props,
      undefined,
      undefined,
    );
    childInstance.on('propsReceived', onPropsReceived);
    childInstance.call('canceled', 'call-canceled');
    childInstance.call('closed', 'call-closed');
    childInstance.call('completed', 'call-completed');
    childInstance.call('propsReceived', { propsReceived: true });

    expect(onCancel).toHaveBeenNthCalledWith(1, 'call-canceled');
    expect(onClose).toHaveBeenNthCalledWith(1, 'call-closed');
    expect(onComplete).toHaveBeenNthCalledWith(1, 'call-completed');
    expect(onPropsReceived).toHaveBeenNthCalledWith(1, { propsReceived: true });
  });
});

describe('sendDataProps', () => {
  it('should throw an exception when child is not provided', () => {
    // @ts-expect-error: types of arguments
    const fn = () => sendDataProps(undefined, undefined);
    expect(fn).toThrow(
      'Footprint should be initialized in order to receive props',
    );
  });

  it('should emit "propsReceived" event', () => {
    const onPropsReceived = jest.fn();
    const child = fakePostMate() as unknown as Child;
    const props = {
      kind: 'verify',
      containerId: 'containerId',
      appearance: {},
      onCancel: undefined,
      onClose: undefined,
      onComplete: undefined,
      options: { showCompletionPage: true, showLogo: true },
      publicKey: 'publicKey',
      userData: {},
      l10n: { locale: 'en-US' },
      variant: 'modal',
    } as unknown as Props;

    child?.on('propsReceived', onPropsReceived);
    sendDataProps(child, props);

    expect(onPropsReceived).toHaveBeenNthCalledWith(1, {
      l10n: { locale: 'en-US' },
      options: { showCompletionPage: true, showLogo: true },
      publicKey: 'publicKey',
      userData: {},
      variant: 'modal',
    });
  });
});

describe('setUpFormRefs', () => {
  it('should throw an exception when child is not provided', () => {
    // @ts-expect-error: types of arguments
    const fn = () => setUpFormRefs(undefined, undefined);
    expect(fn).toThrow(
      'Footprint should be initialized in order to set up refs',
    );
  });

  it('should call getRef when kind is "form"', () => {
    const getRef = jest.fn(async ({ save }) => (save ? save() : undefined));
    const onFormSaved = jest.fn();
    const onFormSaveComplete = jest.fn();
    const child = fakePostMate() as unknown as Child;
    const props = {
      kind: 'form',
      getRef,
    } as unknown as Props;

    child?.on('formSaved', onFormSaved);
    child?.on('formSaveComplete', onFormSaveComplete);
    setUpFormRefs(child, props);

    expect(getRef).toHaveBeenNthCalledWith(1, { save: expect.any(Function) });
    expect(onFormSaved).toHaveBeenNthCalledWith(1, undefined);
  });
});

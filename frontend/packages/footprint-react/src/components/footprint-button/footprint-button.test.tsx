import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FootprintButton from './footprint-button';

const noop = () => undefined;
const fpRenderMock = mock(noop);
const fpInitMock = mock(() => ({ render: fpRenderMock }));

mock.module('@onefootprint/footprint-js', () => ({
  default: { init: fpInitMock },
}));

describe('When error is expected', () => {
  beforeEach(() => {
    spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('should throw Invalid parameters when only button properties are given', () => {
    expect(() =>
      render(
        /* @ts-ignore: insufficient-parameters */
        <FootprintButton className="insufficient-parameters" label="Insufficient Parameters" testID="no-id" />,
      ),
    ).toThrow('Invalid parameters');
  });

  it('should throw when insufficient parameters for auth is given', () => {
    expect(() =>
      render(
        /* @ts-ignore: insufficient-parameters */
        <FootprintButton label="Insufficient Parameters Auth" kind={FootprintComponentKind.Auth} />,
      ),
    ).toThrow('Missing parameter. Please add "authToken" with "updateLoginMethods" or "publicKey"');
  });

  it('should throw when insufficient parameters for auth is given 2', () => {
    expect(() =>
      render(
        /* @ts-ignore: insufficient-parameters */
        <FootprintButton label="Insufficient Parameters Auth" kind={FootprintComponentKind.Auth} authToken="tok_" />,
      ),
    ).toThrow('Missing parameter. Please add "authToken" with "updateLoginMethods" or "publicKey"');
  });

  it('should throw when insufficient parameters for update_login_methods is given', () => {
    expect(() =>
      render(
        /* @ts-ignore: insufficient-parameters */
        <FootprintButton
          label="Insufficient Parameters UpdateLoginMethods"
          kind={FootprintComponentKind.UpdateLoginMethods}
        />,
      ),
    ).toThrow('Missing parameter. Please add "authToken"');
  });

  it('should throw when insufficient parameters for verify is given', () => {
    expect(() =>
      render(
        /* @ts-ignore: insufficient-parameters */
        <FootprintButton label="Insufficient Parameters UpdateLoginMethods" kind={FootprintComponentKind.Verify} />,
      ),
    ).toThrow('Missing parameter. Please add "authToken" or "publicKey"');
  });

  it('should throw Invalid parameters for Form kind', () => {
    expect(() =>
      render(
        <FootprintButton
          label="No support for Form" /* @ts-ignore: invalid kind */
          kind={FootprintComponentKind.Form}
        />,
      ),
    ).toThrow('Invalid parameters');
  });

  it('should throw Invalid parameters for Render kind', () => {
    expect(() =>
      render(
        <FootprintButton
          label="No support for Render" /* @ts-ignore: invalid kind */
          kind={FootprintComponentKind.Render}
        />,
      ),
    ).toThrow('Invalid parameters');
  });
});

describe('Auth', () => {
  it('should render button with publicKey', async () => {
    fpInitMock.mockClear();
    fpRenderMock.mockClear();
    const onClickMock = mock(noop);

    render(
      <FootprintButton
        testID="c3f9fcf8"
        label="optimara"
        onClick={onClickMock}
        kind={FootprintComponentKind.Auth}
        publicKey="pk_"
        bootstrapData={{ 'id.email': 'a@b.com' }}
        options={{ showLogo: true }}
        l10n={{ language: 'es' }}
      />,
    );

    /* checks the <button /> */
    const btn = screen.getByText('optimara');
    expect(btn).toBeTruthy();
    expect(btn.className).toEqual('footprint-auth-button');
    expect(btn.dataset.testid).toEqual('c3f9fcf8');

    await userEvent.click(btn);

    /* footprint.init(fpInitArgs) */
    expect(fpInitMock).toHaveBeenCalledTimes(1);
    const fpInitArgs = JSON.stringify(fpInitMock.mock.calls[0], null, 0);
    expect(fpInitArgs).toEqual(
      '[{"l10n":{"language":"es"},"kind":"auth","options":{"showLogo":true},"bootstrapData":{"id.email":"a@b.com"},"variant":"modal","publicKey":"pk_"}]',
    );

    /* footprint.init(fpInitArgs) */
    expect(fpRenderMock).toHaveBeenCalledTimes(1);
    const fpRenderArgs = JSON.stringify(fpRenderMock.mock.calls[0], null, 0);
    expect(fpRenderArgs).toEqual('[]');

    /* onClick?.(event) */
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('should render button with authToken and updateLoginMethods', async () => {
    fpInitMock.mockClear();
    fpRenderMock.mockClear();
    const onClickMock = mock(noop);

    render(
      <FootprintButton
        testID="1432451f"
        label="envainaria"
        onClick={onClickMock}
        kind={FootprintComponentKind.Auth}
        authToken="tok_"
        updateLoginMethods
        dialogVariant="drawer"
        bootstrapData={{ 'id.phone_number': '+1234' }}
        options={{ showLogo: true }}
        l10n={{ locale: 'es-MX' }}
      />,
    );

    /* checks the <button /> */
    const btn = screen.getByText('envainaria');
    expect(btn).toBeTruthy();
    expect(btn.className).toEqual('footprint-auth-button');
    expect(btn.dataset.testid).toEqual('1432451f');

    await userEvent.click(btn);

    /* footprint.init(fpInitArgs) */
    expect(fpInitMock).toHaveBeenCalledTimes(1);
    const fpInitArgs = JSON.stringify(fpInitMock.mock.calls[0], null, 0);
    expect(fpInitArgs).toEqual(
      '[{"l10n":{"locale":"es-MX"},"kind":"auth","options":{"showLogo":true},"bootstrapData":{"id.phone_number":"+1234"},"variant":"drawer","authToken":"tok_","updateLoginMethods":true}]',
    );

    /* footprint.init(fpInitArgs) */
    expect(fpRenderMock).toHaveBeenCalledTimes(1);
    const fpRenderArgs = JSON.stringify(fpRenderMock.mock.calls[0], null, 0);
    expect(fpRenderArgs).toEqual('[]');

    /* onClick?.(event) */
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});

describe('UpdateLoginMethods', () => {
  it('should render the button for update_login_methods', async () => {
    fpInitMock.mockClear();
    fpRenderMock.mockClear();
    const onClickMock = mock(noop);

    render(
      <FootprintButton
        testID="3d42c1a8"
        label="enrabietadas"
        onClick={onClickMock}
        kind={FootprintComponentKind.UpdateLoginMethods}
        authToken="tok_"
      />,
    );

    /* checks the <button /> */
    const btn = screen.getByText('enrabietadas');
    expect(btn).toBeTruthy();
    expect(btn.className).toEqual('footprint-auth-button');
    expect(btn.dataset.testid).toEqual('3d42c1a8');

    await userEvent.click(btn);

    /* footprint.init(fpInitArgs) */
    expect(fpInitMock).toHaveBeenCalledTimes(1);
    const fpInitArgs = JSON.stringify(fpInitMock.mock.calls[0], null, 0);
    expect(fpInitArgs).toEqual('[{"kind":"update_login_methods","variant":"modal","authToken":"tok_"}]');

    /* footprint.init(fpInitArgs) */
    expect(fpRenderMock).toHaveBeenCalledTimes(1);
    const fpRenderArgs = JSON.stringify(fpRenderMock.mock.calls[0], null, 0);
    expect(fpRenderArgs).toEqual('[]');

    /* onClick?.(event) */
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});

describe('Verify', () => {
  it('should render the button for verify with publicKey', async () => {
    fpInitMock.mockClear();
    fpRenderMock.mockClear();
    const onClickMock = mock(noop);

    render(
      <FootprintButton
        testID="74203c63"
        label="pedernales"
        onClick={onClickMock}
        kind={FootprintComponentKind.Verify}
        publicKey="pk_"
      />,
    );

    /* checks the <button /> */
    const btn = screen.getByText('pedernales');
    expect(btn).toBeTruthy();
    expect(btn.className).toEqual('footprint-verify-button');
    expect(btn.dataset.testid).toEqual('74203c63');

    await userEvent.click(btn);

    /* footprint.init(fpInitArgs) */
    expect(fpInitMock).toHaveBeenCalledTimes(1);
    const fpInitArgs = JSON.stringify(fpInitMock.mock.calls[0], null, 0);
    expect(fpInitArgs).toEqual('[{"kind":"verify","variant":"modal","publicKey":"pk_"}]');

    /* footprint.init(fpInitArgs) */
    expect(fpRenderMock).toHaveBeenCalledTimes(1);
    const fpRenderArgs = JSON.stringify(fpRenderMock.mock.calls[0], null, 0);
    expect(fpRenderArgs).toEqual('[]');

    /* onClick?.(event) */
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('should render the button for verify with authToken', async () => {
    fpInitMock.mockClear();
    fpRenderMock.mockClear();
    const onClickMock = mock(noop);

    render(
      <FootprintButton
        testID="f0c60494"
        label="trastumbarias"
        onClick={onClickMock}
        kind={FootprintComponentKind.Verify}
        authToken="tok_"
      />,
    );

    /* checks the <button /> */
    const btn = screen.getByText('trastumbarias');
    expect(btn).toBeTruthy();
    expect(btn.className).toEqual('footprint-verify-button');
    expect(btn.dataset.testid).toEqual('f0c60494');

    await userEvent.click(btn);

    /* footprint.init(fpInitArgs) */
    expect(fpInitMock).toHaveBeenCalledTimes(1);
    const fpInitArgs = JSON.stringify(fpInitMock.mock.calls[0], null, 0);
    expect(fpInitArgs).toEqual('[{"kind":"verify","variant":"modal","authToken":"tok_"}]');

    /* footprint.init(fpInitArgs) */
    expect(fpRenderMock).toHaveBeenCalledTimes(1);
    const fpRenderArgs = JSON.stringify(fpRenderMock.mock.calls[0], null, 0);
    expect(fpRenderArgs).toEqual('[]');

    /* onClick?.(event) */
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});

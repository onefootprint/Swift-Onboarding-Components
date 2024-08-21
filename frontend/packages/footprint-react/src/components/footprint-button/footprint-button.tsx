import type {
  FootprintAuthProps,
  FootprintUpdateLoginMethodsProps,
  FootprintVerifyProps,
} from '@onefootprint/footprint-js';
import footprint from '@onefootprint/footprint-js';
import type React from 'react';
import { forwardRef } from 'react';

import { getBaseAuthProps, getBaseUpdateLoginMethodsProps, getBaseVerifyProps } from './base-props';
import {
  getConditionalAuthProps,
  getConditionalUpdateLoginMethodsProps,
  getConditionalVerifyProps,
} from './conditional-props';
import InnerButton from './inner-button';
import type {
  AuthConditional,
  AuthTokenOnly,
  BaseSupportedProps,
  FootprintButtonProps,
  PublicKeyOnly,
  SupportedProps,
  VerifyConditional,
} from './types';
import { getClassName, getLabel, isAuth, isError, isUpdateLoginMethods, isVerify } from './utils';

const getBaseProps = (
  p: FootprintButtonProps,
):
  | TypeError
  | FootprintUpdateLoginMethodsProps
  | Omit<FootprintAuthProps, AuthConditional>
  | Omit<FootprintVerifyProps, VerifyConditional> => {
  const base: BaseSupportedProps = {
    appearance: p.appearance,
    containerId: p.containerId,
    l10n: p.l10n,
    onCancel: p.onCancel,
    onClose: p.onClose,
    onComplete: p.onComplete,
    onError: p.onError,
  };

  if (isAuth(p)) return getBaseAuthProps(base, p);
  if (isVerify(p)) return getBaseVerifyProps(base, p);
  if (isUpdateLoginMethods(p)) return getBaseUpdateLoginMethodsProps(base, p);

  return new TypeError('Invalid parameters');
};

function getConditionalProps(p: FootprintButtonProps): TypeError | AuthTokenOnly | PublicKeyOnly {
  if (isAuth(p)) return getConditionalAuthProps(p);
  if (isVerify(p)) return getConditionalVerifyProps(p);
  if (isUpdateLoginMethods(p)) return getConditionalUpdateLoginMethodsProps(p);

  return new TypeError('Invalid parameters');
}

function getConfig(props: FootprintButtonProps): SupportedProps {
  const baseRes = getBaseProps(props);
  const conditionalRes = getConditionalProps(props);

  if (isError(baseRes)) throw baseRes;
  if (isError(conditionalRes)) throw conditionalRes;

  return { ...baseRes, ...conditionalRes } as SupportedProps;
}

const FootprintButton = (props: FootprintButtonProps, ref?: React.Ref<HTMLButtonElement>) => {
  const { className, label, onClick, testID } = props;
  const config = getConfig(props);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const component = footprint.init(config);
    component.render();
    onClick?.(event);
  };

  return (
    <InnerButton
      className={className || getClassName(props)}
      label={label || getLabel(props)}
      onClick={handleClick}
      testID={testID}
      ref={ref}
    />
  );
};

export default forwardRef<HTMLButtonElement, FootprintButtonProps>(FootprintButton);

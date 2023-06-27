import { useTranslation } from '@onefootprint/hooks';
import { DataIdentifier } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useProps from '../../hooks/use-props';
import Render from './components/render';
import useEntitiesVaultDecrypt from './hooks/use-entities-vault-decrypt';
import { SecureRenderProps } from './types';
import getMaskForId from './utils/get-mask-for-id';
import isValidDI from './utils/is-valid-di';

const SecureRender = () => {
  const { t } = useTranslation('components.secure-render');
  const props = useProps<SecureRenderProps>();
  if (!props) {
    throw new Error('SecureRender received empty props');
  }

  const {
    authToken,
    id,
    label,
    canCopy,
    isHidden: isHiddenDefault,
  } = props || {};
  if (!isValidDI(id)) {
    throw new TypeError(`Expected id to be a valid DI, got ${id}`);
  }
  const field = id as DataIdentifier;

  const [isHidden, setIsHidden] = useState(isHiddenDefault);
  const mask = getMaskForId(id);
  const decryptMutation = useEntitiesVaultDecrypt();
  const { data, isLoading: isMutationLoading } = decryptMutation;
  const isLoading = !isHidden && isMutationLoading; // Only show loading indicator if the value is not hidden
  const value = data?.[field] ?? '';

  useEffectOnce(() => {
    decryptMutation.mutate({ authToken, field });
  });

  const handleToggleHidden = () => {
    setIsHidden(!isHidden);
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Render
      isHidden={isHidden}
      label={label ?? t(`di.${id}`)}
      onToggleHidden={handleToggleHidden}
      value={value}
      mask={mask}
      canCopy={canCopy}
    />
  );
};

export default SecureRender;

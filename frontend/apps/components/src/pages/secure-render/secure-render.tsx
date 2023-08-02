import getCustomAppearance from '@onefootprint/appearance';
import { SecureRenderProps } from '@onefootprint/footprint-components-js';
import { useTranslation } from '@onefootprint/hooks';
import { DataIdentifier } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import type { GetServerSideProps } from 'next';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useProps from '../../components/footprint-provider/hooks/use-props';
import Invalid from './components/invalid';
import Loading from './components/loading';
import Render from './components/render';
import useEntitiesVaultDecrypt from './hooks/use-entities-vault-decrypt';
import arePropsValid from './utils/are-props-valid';
import getMaskForId from './utils/get-mask-for-id';

const SecureRender = () => {
  const { t } = useTranslation('pages.secure-render');
  const props = useProps<SecureRenderProps>();
  const decryptMutation = useEntitiesVaultDecrypt();
  const {
    authToken = '',
    id = '',
    label,
    canCopy,
    isHidden: isHiddenDefault,
  } = props || {};

  useEffectOnce(() => {
    decryptMutation.mutate({ authToken, field });
  });
  const [isHidden, setIsHidden] = useState(isHiddenDefault);
  if (!props) {
    return <Loading />;
  }

  const isValid = arePropsValid(props);
  if (!isValid) {
    return <Invalid />;
  }

  const field = id as DataIdentifier;
  const mask = getMaskForId(id);
  const { data, isLoading: isMutationLoading } = decryptMutation;
  const isLoading = !isHidden && isMutationLoading; // Only show loading indicator if the value is not hidden
  const value = data?.[field] ?? '';

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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const params = query as Record<string, string>;
  const { theme, fontSrc, rules, variant } = await getCustomAppearance({
    strategy: ['queryParameters'],
    params,
  });
  return { props: { theme, fontSrc, rules, variant } };
};

export default SecureRender;

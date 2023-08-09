import getCustomAppearance from '@onefootprint/appearance';
import { useTranslation } from '@onefootprint/hooks';
import { DataIdentifier } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import type { GetServerSideProps } from 'next';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useProps from '../../components/footprint-provider/hooks/use-props';
import Invalid from './components/invalid';
import Loading from './components/loading';
import RenderBase from './components/render-base';
import useEntitiesVaultDecrypt from './hooks/use-entities-vault-decrypt';
import { FootprintRenderDataProps } from './types';
import arePropsValid from './utils/are-props-valid';
import getMaskForId from './utils/get-mask-for-id';

const Render = () => {
  const { t } = useTranslation('pages.secure-render');
  const props = useProps<FootprintRenderDataProps>();
  const decryptMutation = useEntitiesVaultDecrypt();
  const {
    authToken = '',
    id = '',
    label,
    canCopy,
    showHiddenToggle,
    defaultHidden,
  } = props || {};
  const field = id as DataIdentifier;

  useEffectOnce(() => {
    decryptMutation.mutate({ authToken, field });
  });

  const [isHidden, setIsHidden] = useState(defaultHidden);
  if (!props) {
    return <Loading />;
  }

  const isValid = arePropsValid(props);
  if (!isValid) {
    return <Invalid />;
  }

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
    <RenderBase
      isHidden={isHidden}
      onToggleHidden={showHiddenToggle ? handleToggleHidden : undefined}
      label={label ?? t(`di.${id}`)}
      value={value}
      mask={mask}
      canCopy={canCopy}
    />
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  res,
  query,
}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=15, stale-while-revalidate=3600',
  );

  const params = query as Record<string, string>;
  const { theme, fontSrc, rules, variant } = await getCustomAppearance({
    strategy: ['queryParameters'],
    params,
    variant: params.variant,
  });
  return { props: { theme, fontSrc, rules, variant } };
};

export default Render;

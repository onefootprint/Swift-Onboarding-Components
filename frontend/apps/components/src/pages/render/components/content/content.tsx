import type { FootprintRenderDataProps } from '@onefootprint/footprint-js';
import { getLogger } from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import type { DataIdentifier } from '@onefootprint/types';
import type { ParseKeys } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useProps from 'src/components/footprint-provider/hooks/use-props';

import useEntitiesVaultDecrypt from '../../hooks/use-entities-vault-decrypt';
import arePropsValid from '../../utils/are-props-valid';
import getMaskForId from '../../utils/get-mask-for-id';
import Invalid from '../invalid';
import RenderBase from '../render-base';

type ContentProps = { fallback: JSX.Element };

const { logError, logTrack, logWarn } = getLogger({ location: 'content' });

const Content = ({ fallback }: ContentProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.secure-render' });
  const [props, setProps] = useState<FootprintRenderDataProps>();
  useProps<FootprintRenderDataProps>(setProps);
  const decryptMutation = useEntitiesVaultDecrypt();
  const { data, isError, error, isSuccess, isPending: isMutationLoading } = decryptMutation;

  const { authToken = '', id = '', label, canCopy, showHiddenToggle, defaultHidden } = props || {};

  const [isHidden, setIsHidden] = useState(defaultHidden);
  const isLoading = !isHidden && isMutationLoading; // Only show loading indicator if the value is not hidden
  useEffect(() => {
    setIsHidden(defaultHidden);
  }, [defaultHidden]);

  const field = id as DataIdentifier;
  const mask = getMaskForId(id);
  const value = data?.[field] ?? '';

  useEffect(() => {
    if (!authToken || !field || isMutationLoading || isSuccess) {
      return;
    }
    decryptMutation.mutate({ authToken, field });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, field, isMutationLoading, isSuccess]);

  const handleToggleHidden = () => {
    setIsHidden(!isHidden);
  };

  useEffect(() => {
    logTrack(
      `Received form props: id=${id}, label=${label}, canCopy=${
        canCopy ? 'true' : 'false'
      }, defaultHidden=${defaultHidden ? 'true' : 'false'}, showHiddenToggle=${
        showHiddenToggle ? 'true' : 'false'
      }. ${authToken ? 'Has' : 'No'} auth token.`,
    );
  }, [authToken, id, label, canCopy, showHiddenToggle, defaultHidden]);

  if (isLoading) {
    logTrack('Fetching client token fields');
    return fallback; // Default to a loading state here
  }
  if (!props) {
    logWarn('No props passed to secure form');
    return fallback; // Default to a loading state here
  }

  const isValid = arePropsValid(props);
  if (!isValid) {
    logError('Invalid props passed to secure form');
    return <Invalid />;
  }

  if (isError) {
    logError(`Decrypting vault data failed with error: ${getErrorMessage(error)}`, error);
    return <Invalid />;
  }

  if (!data) {
    logError('Received empty response while decrypting vault data');
    return <Invalid />;
  }

  return (
    <RenderBase
      isHidden={isHidden}
      onToggleHidden={showHiddenToggle ? handleToggleHidden : undefined}
      label={label ?? t(`di.${id}` as ParseKeys<'common'>)}
      value={value}
      mask={mask}
      canCopy={canCopy}
    />
  );
};

export default Content;

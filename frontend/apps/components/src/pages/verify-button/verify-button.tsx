import getCustomAppearance from '@onefootprint/appearance';
import type { FootprintVerifyButtonDataProps } from '@onefootprint/footprint-js';
import { FootprintPublicEvent } from '@onefootprint/footprint-js';
import { FootprintButton } from '@onefootprint/ui';
import type { GetServerSideProps } from 'next';
import React, { useState } from 'react';
import { useFootprintProvider } from 'src/components/footprint-provider';

import useProps from '../../components/footprint-provider/hooks/use-props';

const VerifyButton = () => {
  const [props, setProps] = useState<FootprintVerifyButtonDataProps>();
  useProps<FootprintVerifyButtonDataProps>(setProps);

  const { label } = props || {};
  const footprintProvider = useFootprintProvider();
  const isValid = typeof label === 'string' || typeof label === 'undefined';

  const handleClick = () => {
    footprintProvider.send(FootprintPublicEvent.clicked);
  };

  if (!props) {
    return null;
  }

  return <FootprintButton disabled={!isValid} text={isValid ? label : undefined} onClick={handleClick} fullWidth />;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const params = query as Record<string, string>;
  const { theme, fontSrc, rules, variant } = await getCustomAppearance({
    strategy: ['queryParameters'],
    params,
    variant: params.variant,
  });
  return { props: { theme, fontSrc, rules, variant } };
};

export default VerifyButton;

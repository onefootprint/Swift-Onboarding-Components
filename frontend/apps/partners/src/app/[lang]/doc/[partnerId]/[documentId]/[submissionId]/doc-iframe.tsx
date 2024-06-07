'use client';

import { useObjectUrl } from '@onefootprint/ui';
import React from 'react';

type Props = {
  id: string;
  fileName: string;
  base64Data: string | undefined;
};

// This needs its own component so it can be rendered client-side, with object URL support.
const DocIFrame = ({ id, fileName, base64Data }: Props) => {
  const { objectUrl } = useObjectUrl(base64Data || null);

  return objectUrl ? <iframe id={id} title={fileName} width="100%" height="100%" src={objectUrl} /> : null;
};

export default DocIFrame;

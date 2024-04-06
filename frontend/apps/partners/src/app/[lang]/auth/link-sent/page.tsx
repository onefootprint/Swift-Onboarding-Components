import type { Metadata } from 'next';
import React from 'react';

import MagicLinkSentContent from './content';

export const metadata: Metadata = {
  title: 'Footprint - Magic link sent!',
};

const MagicLinkSent = () => (
  <MagicLinkSentContent email="bruno@onefootprint.com" />
);

export default MagicLinkSent;

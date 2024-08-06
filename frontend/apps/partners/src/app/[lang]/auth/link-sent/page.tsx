import type { Metadata } from 'next';

import MagicLinkSentContent from './content';

export const metadata: Metadata = {
  title: 'Footprint - Magic link sent!',
};

type MagicLinkSentProps = { searchParams: { email?: string } };

const MagicLinkSent = ({ searchParams: { email } }: MagicLinkSentProps) => (
  <MagicLinkSentContent email={email || '-'} />
);

export default MagicLinkSent;

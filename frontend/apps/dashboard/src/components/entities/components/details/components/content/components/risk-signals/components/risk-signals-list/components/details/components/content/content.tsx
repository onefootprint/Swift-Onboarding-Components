import type { AmlHitMedia, RiskSignal } from '@onefootprint/types';
import { Divider, Stack } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import Matches from './components/matches';
import HitsMedia from './components/matches/components/hits-media';
import Overview from './components/overview';

type ContentProps = {
  riskSignal: RiskSignal;
  handleShowAmlMedia: (media: AmlHitMedia[]) => void;
  amlMedia: AmlHitMedia[];
};

const Content = ({ riskSignal, handleShowAmlMedia, amlMedia }: ContentProps) => {
  if (amlMedia.length) {
    return <HitsMedia mediaList={amlMedia} />;
  }

  return (
    <AnimatePresence>
      <motion.div animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Stack direction="column" height="100%">
          <Overview description={riskSignal.description} scopes={riskSignal.scopes} severity={riskSignal.severity} />
          {riskSignal.hasAmlHits && (
            <>
              <Divider />
              <Matches riskSignalId={riskSignal.id} handleShowAmlMedia={handleShowAmlMedia} />
            </>
          )}
        </Stack>
      </motion.div>
    </AnimatePresence>
  );
};

export default Content;

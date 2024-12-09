import type { AmlHitMedia, RiskSignalDetail } from '@onefootprint/request-types/dashboard';
import { Divider, Stack } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';

import Matches from './components/matches';
import HitsMedia from './components/matches/components/hits-media';
import Overview from './components/overview';

type ContentProps = {
  riskSignalDetail: RiskSignalDetail;
  handleShowAmlMedia: (media: AmlHitMedia[]) => void;
  amlMedia: AmlHitMedia[];
};

const Content = ({ riskSignalDetail, handleShowAmlMedia, amlMedia }: ContentProps) => {
  const { id, description, scopes, severity, hasAmlHits } = riskSignalDetail;

  if (amlMedia.length) {
    return <HitsMedia mediaList={amlMedia} />;
  }

  return (
    <AnimatePresence>
      <motion.div animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Stack direction="column" height="100%">
          <Overview description={description} scopes={scopes} severity={severity} />
          {hasAmlHits && (
            <>
              <Divider />
              <Matches riskSignalId={id} handleShowAmlMedia={handleShowAmlMedia} />
            </>
          )}
        </Stack>
      </motion.div>
    </AnimatePresence>
  );
};

export default Content;

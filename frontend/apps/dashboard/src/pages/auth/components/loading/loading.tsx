import { IcoFootprint40 } from '@onefootprint/icons';
import { motion } from 'framer-motion';

const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <motion.div
      className="flex items-center justify-center w-[260px] h-[260px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'loop',
      }}
    >
      <IcoFootprint40 color="primary" />
    </motion.div>
  </div>
);

export default Loading;

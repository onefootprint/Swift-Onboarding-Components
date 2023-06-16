import { motion } from 'framer-motion';
import React from 'react';

type FadeInConatinerProps = {
  children: React.ReactNode;
};

const FadeInContainer = ({ children }: FadeInConatinerProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, transition: { type: 'tween', duration: 0.7 } }}
  >
    {children}
  </motion.div>
);

export default FadeInContainer;

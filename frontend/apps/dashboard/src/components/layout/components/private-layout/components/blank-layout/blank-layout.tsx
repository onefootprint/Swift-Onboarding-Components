import { motion } from 'framer-motion';
import React from 'react';

export type BlankLayoutProps = {
  children: React.ReactNode;
};

const BlankLayout = ({ children }: BlankLayoutProps) => (
  <motion.div animate={{ opacity: 1 }} exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
    <div data-testid="private-blank-layout">{children}</div>
  </motion.div>
);

export default BlankLayout;

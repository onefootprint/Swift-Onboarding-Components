import type React from 'react';

import styles from './content-layout.module.css';

const ContentLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.container}>{children}</div>;
};

export default ContentLayout;

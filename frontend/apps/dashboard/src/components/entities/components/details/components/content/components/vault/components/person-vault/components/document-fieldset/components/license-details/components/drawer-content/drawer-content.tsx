import type { Document, EntityVault } from '@onefootprint/types';
import ConfidenceScores from '../../../confidence-scores';

export type DrawerContentProps = {
  document: Document;
  vault: EntityVault;
};

const DrawerContent = ({ document }: DrawerContentProps) => {
  return <ConfidenceScores document={document} />;
};

export default DrawerContent;

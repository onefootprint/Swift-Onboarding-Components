import {
  CollectedDocumentDataOption,
  OnboardingConfig,
} from '@onefootprint/types';

const requiresIdDoc = (config?: OnboardingConfig) => {
  if (!config) return false;
  return (
    config.mustCollectData.includes(CollectedDocumentDataOption.document) ||
    config.mustCollectData.includes(
      CollectedDocumentDataOption.documentAndSelfie,
    )
  );
};

export default requiresIdDoc;

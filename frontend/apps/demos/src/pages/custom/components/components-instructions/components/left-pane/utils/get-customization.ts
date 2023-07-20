import { FootprintAppearance } from '@onefootprint/footprint-components-js';

type CustomizationProps = {
  appearance: FootprintAppearance;
};

const getCustomization = ({
  appearance,
}: CustomizationProps) => `import { FootprintAppearance } from '@onefootprint/footprint-components-js';

export const appearance: FootprintAppearance = ${JSON.stringify(
  appearance,
  null,
  2,
)}
`;

export default getCustomization;

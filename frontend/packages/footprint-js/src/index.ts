import initFootprint from './footprint';
import vanillaIntegration from './utils/footprint-vanilla';

const footprint = initFootprint();
vanillaIntegration(footprint);

export type {
  Footprint,
  FootprintAppearance,
  FootprintAppearanceParams,
  FootprintAppearanceRules,
  FootprintAppearanceTheme,
  FootprintAppearanceVariables,
  FootprintExternalStyles,
  FootprintMainStyles,
  FootprintShowParams,
  ShowFootprint,
} from './footprint-js.types';
export { FootprintEvents } from './footprint-js.types';

export default footprint;

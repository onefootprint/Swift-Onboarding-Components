import initFootprint from './footprint';
import vanillaIntegration from './utils/footprint-vanilla';

const footprint = initFootprint();
vanillaIntegration(footprint);

export type {
  Footprint,
  // TODO: Remove Footprint as it's repetitive
  FootprintAppearance,
  FootprintAppearanceParams,
  FootprintAppearanceRules,
  FootprintAppearanceTheme,
  FootprintAppearanceVariables,
  FootprintExternalStyles,
  FootprintMainStyles,
  FootprintShowParams,
  ShowFootprint,
  UserData,
} from './footprint-js.types';
export { FootprintEvents } from './footprint-js.types';
export { default as identifyUser } from './utils/identify-user';

export default footprint;

import initFootprint from './footprint';
import vanillaIntegration from './utils/footprint-vanilla';

const footprint = initFootprint();
vanillaIntegration(footprint);

export type {
  Footprint,
  FootprintAppearance,
  FootprintAppearanceRules,
  FootprintAppearanceTheme,
  FootprintAppearanceVariables,
  FootprintShowParams,
  FootprintUserData,
  OpenFootprint,
} from './footprint-js.types';
export {
  FootprintInternalEvent,
  FootprintPublicEvent,
} from './footprint-js.types';
export { default as identifyUser } from './utils/identify-user';

export default footprint;

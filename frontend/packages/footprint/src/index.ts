import vanillaIntegration from './adapters/vanilla';
import Footprint from './footprint';
import UiManager from './footprint/ui-manager';

const getUrl = () =>
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://id.onefootprint.com';

const footprintUrl = getUrl();
const uiManager = new UiManager();
const footprint = new Footprint(footprintUrl, uiManager);
vanillaIntegration(footprint)();

export default footprint;

import Footprint from './footprint';
import PostmateAdapter from './iframe/postmate-iframe-adapter';
import VanillaAdapter from './ui/vanilla-ui-adapter.ts';

// TODO: AJUST
const iframeUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://bifrost.ui.footprint.dev/';

const postmateAdapter = new PostmateAdapter(iframeUrl);
const footprint = new Footprint(new VanillaAdapter(postmateAdapter));

export default footprint;

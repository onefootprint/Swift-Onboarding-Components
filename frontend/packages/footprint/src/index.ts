import Footprint from './footprint';
import PostmateAdapter from './iframe-manager/postmate-adapter';
import VanillaAdapter from './ui-manager/vanilla-adapter';

// TODO: AJUST
const iframeUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://bifrostui.footprint.dev/';

const postmateAdapter = new PostmateAdapter(iframeUrl);
const footprint = new Footprint(new VanillaAdapter(postmateAdapter));

export default footprint;

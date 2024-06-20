import type { Actor } from '@onefootprint/types';
import { ActorKind } from '@onefootprint/types';

// This is adapted from actor.tsx
const getActorText = (actor?: Actor) => {
  // TODO: use translations
  if (!actor) return '';
  let actorText;
  switch (actor.kind) {
    case ActorKind.user:
      actorText = actor.fpId;
      break;
    case ActorKind.footprint:
      actorText = 'Footprint';
      break;
    case ActorKind.firmEmployee:
      actorText = 'Footprint Risk Ops';
      break;
    case ActorKind.organization:
      actorText = actor.member;
      break;
    case ActorKind.apiKey:
      actorText = actor.name;
      break;
    default:
      actorText = '';
  }
  return actorText;
};

export default getActorText;

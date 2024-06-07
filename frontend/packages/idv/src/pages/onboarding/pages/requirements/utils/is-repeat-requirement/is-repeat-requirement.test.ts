import type { OnboardingRequirement } from '@onefootprint/types';
import { DocumentRequestKind, OnboardingRequirementKind } from '@onefootprint/types';

import isRepeatRequirement from './is-repeat-requirement';

describe('isRepeatRequirement', () => {
  test.each([
    {
      a: { kind: OnboardingRequirementKind.collectKycData },
      b: { kind: OnboardingRequirementKind.collectKycData },
      x: true,
    },
    {
      a: { kind: OnboardingRequirementKind.collectKycData },
      b: { kind: OnboardingRequirementKind.registerPasskey },
      x: false,
    },
    {
      a: {
        kind: OnboardingRequirementKind.idDoc,
        config: {
          kind: DocumentRequestKind.Identity,
        },
      },
      b: {
        kind: OnboardingRequirementKind.idDoc,
        config: {
          kind: DocumentRequestKind.ProofOfAddress,
        },
      },
      x: false,
    },
    {
      a: {
        kind: OnboardingRequirementKind.idDoc,
        config: {
          kind: DocumentRequestKind.Identity,
        },
      },
      b: {
        kind: OnboardingRequirementKind.idDoc,
        config: {
          kind: DocumentRequestKind.Identity,
        },
      },
      x: true,
    },
    {
      a: {
        kind: OnboardingRequirementKind.idDoc,
        config: {
          kind: DocumentRequestKind.Custom,
          name: 'flerp',
        },
      },
      b: {
        kind: OnboardingRequirementKind.idDoc,
        config: {
          kind: DocumentRequestKind.Custom,
          name: 'flerp',
        },
      },
      x: true,
    },
    {
      a: {
        kind: OnboardingRequirementKind.idDoc,
        config: {
          kind: DocumentRequestKind.Custom,
          name: 'flerp',
        },
      },
      b: {
        kind: OnboardingRequirementKind.idDoc,
        config: {
          kind: DocumentRequestKind.Custom,
          name: 'derp',
        },
      },
      x: false,
    },
    {
      a: { kind: OnboardingRequirementKind.collectKycData },
      b: undefined,
      x: false,
    },
  ])('.', ({ a, b, x }) => {
    expect(isRepeatRequirement(a as OnboardingRequirement, b as OnboardingRequirement | undefined)).toBe(x);
  });
});

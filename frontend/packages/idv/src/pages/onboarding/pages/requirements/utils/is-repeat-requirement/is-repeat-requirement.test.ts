import type { OnboardingRequirement } from '@onefootprint/types';
import {
  DocumentRequestKind,
  OnboardingRequirementKind,
} from '@onefootprint/types';

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
        documentRequestKind: DocumentRequestKind.Identity,
      },
      b: {
        kind: OnboardingRequirementKind.idDoc,
        documentRequestKind: DocumentRequestKind.ProofOfAddress,
      },
      x: false,
    },
    {
      a: {
        kind: OnboardingRequirementKind.idDoc,
        documentRequestKind: DocumentRequestKind.Identity,
      },
      b: {
        kind: OnboardingRequirementKind.idDoc,
        documentRequestKind: DocumentRequestKind.Identity,
      },
      x: true,
    },
    {
      a: { kind: OnboardingRequirementKind.collectKycData },
      b: undefined,
      x: false,
    },
  ])('.', ({ a, b, x }) => {
    expect(
      isRepeatRequirement(
        a as OnboardingRequirement,
        b as OnboardingRequirement | undefined,
      ),
    ).toBe(x);
  });
});

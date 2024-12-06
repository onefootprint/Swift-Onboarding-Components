import type {
  ActorApiKey,
  Annotation,
  CollectedDataEventData,
  DocumentUploadedEventData,
  ExternalIntegrationCalledData,
  LivenessEventData,
  OnboardingDecisionEventData,
  TimelineEvent,
  VaultCreatedEventData,
  WorkflowTriggeredEventData,
} from '@onefootprint/types';
import {
  ActorKind,
  AuthMethodKind,
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  DecisionStatus,
  DocumentRequestKind,
  EntityLabel,
  IdDocStatus,
  LivenessSource,
  TimelineEventKind,
  TriggerKind,
  WorkflowKind,
} from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';
import {
  AuthMethodAction,
  type AuthMethodUpdatedData,
  ExternalIntegrationKind,
  type LabelAddedEventData,
  type WorkflowStartedEventData,
  WorkflowStartedEventKind,
} from '@onefootprint/types/src/data/timeline';
import startCase from 'lodash/startCase';

import getActorText from '../get-actor-text';

// This is adapted from audit-trail-timeline.tsx
const getTimelineEventText = (event: TimelineEvent): string => {
  // TODO: use translations
  const {
    event: { kind, data },
  } = event;

  if (kind === TimelineEventKind.liveness) {
    const eventData = data as LivenessEventData;
    return eventData.source === LivenessSource.skipped ? 'Liveness check skipped' : 'Liveness check succeeded';
  }

  if (kind === TimelineEventKind.labelAdded) {
    const eventData = data as LabelAddedEventData;

    const labelKindText: Record<EntityLabel, string> = {
      [EntityLabel.active]: 'Active',
      [EntityLabel.offboard_fraud]: 'Offboard (Fraud)',
      [EntityLabel.offboard_other]: 'Offboard (Other)',
    };
    return `Labeled as ${labelKindText[eventData.kind]}`;
  }

  if (kind === TimelineEventKind.dataCollected) {
    const eventData = data as CollectedDataEventData;

    if (eventData.attributes.length) {
      let title = eventData.isPrefill ? 'Prefilled' : 'Collected';
      const actorText = getActorText(eventData.actor);
      title = actorText ? `${actorText} edited` : title;

      const cdoText: Partial<
        Record<
          | CollectedKybDataOption
          | CollectedKycDataOption
          | CollectedInvestorProfileDataOption
          | CollectedDocumentDataOption
          | SupportedIdDocTypes,
          string
        >
      > = {
        [CollectedKycDataOption.name]: 'Full name',
        [CollectedKycDataOption.email]: 'Email',
        [CollectedKycDataOption.address]: 'Address',
        [CollectedKycDataOption.dob]: 'Date of birth',
        [CollectedKycDataOption.phoneNumber]: 'Phone number',
        [CollectedKycDataOption.ssn4]: 'SSN (Last 4)',
        [CollectedKycDataOption.ssn9]: 'SSN (Full)',
        [CollectedKycDataOption.nationality]: 'Nationality',
        [CollectedKycDataOption.usLegalStatus]: 'Legal status in the U.S.',
        [CollectedKybDataOption.name]: 'Business name',
        [CollectedKybDataOption.tin]: 'Taxpayer Identification Number (TIN)',
        [CollectedKybDataOption.address]: 'Registered business address',
        [CollectedKybDataOption.phoneNumber]: 'Business phone number',
        [CollectedKybDataOption.website]: 'Business website',
        [CollectedKybDataOption.corporationType]: 'Legal entity type',
        [CollectedKybDataOption.kycedBeneficialOwners]: 'Business beneficial owners',
        [CollectedInvestorProfileDataOption.investorProfile]: 'Investor profile',
        [CollectedDocumentDataOption.document]: 'ID Document',
        [CollectedDocumentDataOption.documentAndSelfie]: 'ID Document & Selfie',
        [SupportedIdDocTypes.driversLicense]: "Driver's license",
        [SupportedIdDocTypes.passport]: 'Passport',
        [SupportedIdDocTypes.idCard]: 'ID card',
        [SupportedIdDocTypes.visa]: 'Visa',
        [SupportedIdDocTypes.workPermit]: 'Work permit / EAD card',
        [SupportedIdDocTypes.residenceDocument]: 'Residence card / Green card',
      };
      const cdoList = eventData.attributes
        .map(cdo => (cdo in cdoText ? cdoText[cdo] : startCase(cdo.replace('_', ' '))))
        .join(', ');

      const end = eventData.isPrefill ? " from user's existing data in Footprint" : '';
      return `${title} ${cdoList}${end}`;
    }
  }

  if (kind === TimelineEventKind.documentUploaded) {
    const eventData = data as DocumentUploadedEventData;
    const statusText: Record<IdDocStatus, string> = {
      [IdDocStatus.complete]: 'Collected',
      [IdDocStatus.pending]: 'Started collecting',
      [IdDocStatus.failed]: 'Unable to collect',
      [IdDocStatus.abandoned]: 'Abandoned collecting',
    };
    let documentType;
    if (eventData.config.kind === DocumentRequestKind.Custom) {
      documentType = eventData.config.data.name;
    } else {
      const documentText: Partial<Record<SupportedIdDocTypes, string>> = {
        [SupportedIdDocTypes.idCard]: 'ID card',
        [SupportedIdDocTypes.driversLicense]: "Driver's license",
        [SupportedIdDocTypes.passport]: 'Passport',
        [SupportedIdDocTypes.visa]: 'Visa',
        [SupportedIdDocTypes.workPermit]: 'Work permit / EAD card',
        [SupportedIdDocTypes.residenceDocument]: 'Residence card / Green card',
        [SupportedIdDocTypes.voterIdentification]: 'Voter identification',
        [SupportedIdDocTypes.ssnCard]: 'SSN Card',
        [SupportedIdDocTypes.lease]: 'Lease',
        [SupportedIdDocTypes.bankStatement]: 'Bank Statement',
        [SupportedIdDocTypes.utilityBill]: 'Utility Bill',
        [SupportedIdDocTypes.proofOfAddress]: 'Proof of Address',
        [SupportedIdDocTypes.passportCard]: 'Passport card',
      };
      documentType = documentText[eventData.documentType];
    }
    return `${statusText[eventData.status]} ${documentType}`;
  }

  if (kind === TimelineEventKind.onboardingDecision) {
    const eventData = data as OnboardingDecisionEventData;

    const {
      decision: { workflowKind, source, status, obConfiguration, clearedManualReviews },
      workflowSource,
    } = eventData;
    const statusToText: Record<DecisionStatus, string> = {
      [DecisionStatus.fail]: 'Fail',
      [DecisionStatus.pass]: 'Pass',
      [DecisionStatus.none]: 'None',
      // We don't expect to receive an OBD with status stepUp in prod
      [DecisionStatus.stepUp]: 'Step up required',
    };
    const statusText = statusToText[status];

    if (source.kind === ActorKind.footprint && workflowKind === WorkflowKind.Document) {
      return 'Finished uploading requested documents';
    }
    if (source.kind === ActorKind.footprint) {
      let text = `Onboarded onto ${obConfiguration.name}`;
      if (workflowSource === 'tenant') {
        text = `Ran ${obConfiguration.name} via API`;
      }
      let outcome = '';
      if (status === DecisionStatus.pass || status === DecisionStatus.fail) {
        outcome = ` with ${statusText} outcome`;
      }
      return `${text}${outcome}`;
    }
    if (status === DecisionStatus.none && clearedManualReviews?.length) {
      return `Manual review cleared by ${getActorText(source)}`;
    }
    return `Manually reviewed and marked as ${statusText} by ${getActorText(source)}`;
  }

  if (kind === TimelineEventKind.watchlistCheck) {
    return 'Watchlist check performed';
  }

  if (kind === TimelineEventKind.freeFormNote) {
    const eventData = data as Annotation;
    return `Note added by ${getActorText(eventData.source)}`;
  }

  if (kind === TimelineEventKind.vaultCreated) {
    const eventData = data as VaultCreatedEventData;
    return `User created by ${(eventData.actor as ActorApiKey).name}`;
  }

  if (kind === TimelineEventKind.workflowTriggered) {
    const eventData = data as WorkflowTriggeredEventData;
    const { config } = eventData;
    let actionText;
    if (config.kind === TriggerKind.Onboard) {
      actionText = 'onboard onto another playbook'; // TODO: more complex logic to fetch playbook name
    } else if (config.kind === TriggerKind.Document) {
      const { configs } = config.data;
      const customConfig = configs.find(c => c.kind === DocumentRequestKind.Custom);
      if (configs.some(c => c.kind === DocumentRequestKind.ProofOfAddress)) {
        actionText = 'provide proof of address';
      } else if (configs.some(c => c.kind === DocumentRequestKind.ProofOfSsn)) {
        actionText = 'provide proof of SSN';
      } else if (customConfig && 'name' in customConfig.data) {
        actionText = `upload ${customConfig.data.name}`;
      } else if (configs.some(c => c.kind === DocumentRequestKind.Identity)) {
        actionText = 'upload ID photo';
      }
    }
    return `Requested to ${actionText} by ${getActorText(eventData.actor)}`;
  }

  if (kind === TimelineEventKind.workflowStarted) {
    const eventData = data as WorkflowStartedEventData;

    if (eventData.kind === WorkflowStartedEventKind.playbook) {
      if (eventData.workflowSource === 'tenant') {
        return `Started running ${eventData.playbook.name} via API`;
      }
      return `Started onboarding onto ${eventData.playbook.name}`;
    }
    if (eventData.kind === WorkflowStartedEventKind.document) {
      return 'Started uploading document';
    }
  }

  if (kind === TimelineEventKind.authMethodUpdated) {
    const eventData = data as AuthMethodUpdatedData;

    const verb = eventData.action === AuthMethodAction.replace ? 'updated the' : 'registered';
    const end =
      eventData.action === AuthMethodAction.replace
        ? 'used as a Footprint login method'
        : 'as a Footprint login method';
    const methodText: Record<AuthMethodKind, string> = {
      [AuthMethodKind.phone]: 'Phone number',
      [AuthMethodKind.email]: 'Email',
      [AuthMethodKind.passkey]: 'Passkey',
    };
    return `User ${verb} ${methodText[eventData.kind]} ${end}`;
  }

  if (kind === TimelineEventKind.externalIntegrationCalled) {
    const eventData = data as ExternalIntegrationCalledData;

    const integrationText: Record<ExternalIntegrationKind, string> = {
      [ExternalIntegrationKind.alpacaCip]: 'Alpaca CIP',
    };
    return `${
      eventData.successful ? 'Successfully' : 'Unsuccessfully'
    } submitted user to ${integrationText[eventData.integration]}`;
  }

  if (kind === TimelineEventKind.stepUp) {
    return 'Step-up required';
  }

  return '';
};

export default getTimelineEventText;

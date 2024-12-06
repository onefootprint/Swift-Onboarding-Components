import getTimelineEventText from './get-timeline-event-text';
import {
  authMethodUpdatedEventFixture,
  dataCollectedEventFixture,
  documentUploadedEventFixture,
  externalIntegrationCalledEventFixture,
  freeFormNoteEventFixture,
  labelAddedEventFixture,
  livenessEventFixture,
  onboardingDecisionEventFixture,
  stepUpEventFixture,
  vaultCreatedEventFixture,
  watchlistCheckEventFixture,
  workflowStartedEventFixture,
  workflowTriggeredEventFixture,
} from './get-timeline-event-text.test.config';

describe('getTimelineEventText', () => {
  describe('when an event with kind TimelineEventKind.liveness is passed in', () => {
    it('should return the correct text', () => {
      const livenessText = getTimelineEventText(livenessEventFixture);
      expect(livenessText).toEqual('Liveness check skipped');
    });
  });

  describe('when an event with kind TimelineEventKind.labelAdded is passed in', () => {
    it('should return the correct text', () => {
      const labelAddedText = getTimelineEventText(labelAddedEventFixture);
      expect(labelAddedText).toEqual('Labeled as Active');
    });
  });

  describe('when an event with kind TimelineEventKind.dataCollected is passed in', () => {
    it('should return the correct text', () => {
      const dataCollectedText = getTimelineEventText(dataCollectedEventFixture);
      expect(dataCollectedText).toEqual('Collected Full name, Date of birth, SSN (Full), Address, Email, Phone number');
    });
  });

  describe('when an event with kind TimelineEventKind.documentUploaded is passed in', () => {
    it('should return the correct text', () => {
      const documentUploadedText = getTimelineEventText(documentUploadedEventFixture);
      expect(documentUploadedText).toEqual('Started collecting ID card');
    });
  });

  describe('when an event with kind TimelineEventKind.onboardingDecision is passed in', () => {
    it('should return the correct text', () => {
      const onboardingDecisionText = getTimelineEventText(onboardingDecisionEventFixture);
      expect(onboardingDecisionText).toEqual('Onboarded onto My Playbook with Pass outcome');
    });
  });

  describe('when an event with kind TimelineEventKind.combinedWatchlistChecks is passed in', () => {
    it('should return the correct text', () => {
      const combinedWatchlistChecksText = getTimelineEventText(watchlistCheckEventFixture);
      expect(combinedWatchlistChecksText).toEqual('Watchlist check performed');
    });
  });

  describe('when an event with kind TimelineEventKind.freeFormNote is passed in', () => {
    it('should return the correct text', () => {
      const freeFormNoteText = getTimelineEventText(freeFormNoteEventFixture);
      expect(freeFormNoteText).toEqual('Note added by Footprint');
    });
  });

  describe('when an event with kind TimelineEventKind.vaultCreated is passed in', () => {
    it('should return the correct text', () => {
      const vaultCreatedText = getTimelineEventText(vaultCreatedEventFixture);
      expect(vaultCreatedText).toEqual('User created by Production key');
    });
  });

  describe('when an event with kind TimelineEventKind.workflowTriggered is passed in', () => {
    it('should return the correct text', () => {
      const workflowTriggeredText = getTimelineEventText(workflowTriggeredEventFixture);
      expect(workflowTriggeredText).toEqual('Requested to upload ID photo by Piip Penguin (piip@onefootprint.com)');
    });
  });

  describe('when an event with kind TimelineEventKind.workflowStarted is passed in', () => {
    it('should return the correct text', () => {
      const workflowStartedText = getTimelineEventText(workflowStartedEventFixture);
      expect(workflowStartedText).toEqual('Started onboarding onto My Playbook');
    });
  });

  describe('when an event with kind TimelineEventKind.authMethodUpdated is passed in', () => {
    it('should return the correct text', () => {
      const authMethodUpdatedText = getTimelineEventText(authMethodUpdatedEventFixture);
      expect(authMethodUpdatedText).toEqual('User registered Phone number as a Footprint login method');
    });
  });

  describe('when an event with kind TimelineEventKind.externalIntegrationCalled is passed in', () => {
    it('should return the correct text', () => {
      const externalIntegrationCalledText = getTimelineEventText(externalIntegrationCalledEventFixture);
      expect(externalIntegrationCalledText).toEqual('Successfully submitted user to Alpaca CIP');
    });
  });

  describe('when an event with kind TimelineEventKind.stepUp is passed in', () => {
    it('should return the correct text', () => {
      const stepUpText = getTimelineEventText(stepUpEventFixture);
      expect(stepUpText).toEqual('Step-up required');
    });
  });
});

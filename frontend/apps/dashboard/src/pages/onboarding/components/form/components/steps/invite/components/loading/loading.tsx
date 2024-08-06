import { Portal, Shimmer, Stack } from '@onefootprint/ui';

const Loading = () => (
  <Stack aria-busy data-testid="onboarding-invite-loading">
    <Stack gap={4} marginBottom={5}>
      <Stack direction="column" gap={3} id="email-shimmer">
        <Shimmer height="20px" width="92px" />
        <Shimmer height="40px" width="294px" />
      </Stack>
      <Stack id="roles-shimmer" direction="column" gap={3}>
        <Shimmer height="20px" width="28px" />
        <Shimmer height="40px" width="144px" />
      </Stack>
    </Stack>
    <Stack id="add-more-button-shimmer">
      <Shimmer height="21px" width="86px" />
    </Stack>
    <Portal selector="#onboarding-cta-portal">
      <Stack id="submit-button-shimmer" gap={7}>
        <Shimmer height="40px" width="32px" />
        <Shimmer height="40px" width="120px" />
      </Stack>
    </Portal>
  </Stack>
);

export default Loading;

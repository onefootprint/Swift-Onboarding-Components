import * as Haptics from 'expo-haptics';

const { NotificationFeedbackType: notification, ImpactFeedbackStyle: impact } =
  Haptics;

const haptic = {
  impact: () => Haptics.impactAsync(impact.Light),
  error: () => Haptics.notificationAsync(notification.Error),
  warning: () => Haptics.notificationAsync(notification.Warning),
  success: () => Haptics.notificationAsync(notification.Success),
};

export default haptic;

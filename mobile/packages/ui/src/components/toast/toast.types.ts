import type { ImageProps, ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ColorTheme, Icon, MessageOptions, Position } from 'react-native-flash-message';

export type NotificationVariants = 'success' | 'info' | 'error';

export type FlashVariants = keyof Pick<ColorTheme, 'danger' | 'info' | 'success'>;

export type Message = {
  autoHide: boolean;
  cta?: { label: string; onPress?: () => void };
  description: string;
  message: string;
  variant: NotificationVariants;
};

export type ShowToast = {
  autoHide?: boolean;
  cta?: { label: string; onPress: () => void };
  description: string;
  title: string;
  variant: NotificationVariants;
};

export type MessageComponentProps = {
  position?: Position;
  floating?: boolean;
  message: Message;
  hideStatusBar?: boolean;
  icon: React.ReactElement | Icon;
  style: StyleProp<ViewStyle>;
  textStyle: StyleProp<TextStyle>;
  titleStyle: StyleProp<TextStyle>;
  renderFlashMessageIcon?(
    icon: React.ReactElement | Icon,
    style: StyleProp<ImageStyle>,
    iconProps: Partial<ImageProps>,
  ): React.ReactElement<{}> | null;
  renderBeforeContent?(message: MessageOptions): React.ReactElement<{}> | null;
  renderCustomContent?(message: MessageOptions): React.ReactElement<{}> | null;
  renderAfterContent?(message: MessageOptions): React.ReactElement<{}> | null;
};

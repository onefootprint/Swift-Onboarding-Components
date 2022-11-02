type Overlay = {
  bg: string;
};

type Loading = {
  bg: string;
  borderRadius: string;
  color: string;
  padding: string;
};

type FpButton = {
  height: string;
  borderRadius: string;
};

type Dialog = {
  bg: string;
  elevation: string;
  borderRadius: string;
};

export type Bifrost = {
  dialog: Dialog;
  fpButton: FpButton;
  loading: Loading;
  overlay: Overlay;
};

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

export type Bifrost = {
  overlay: Overlay;
  loading: Loading;
  fpButton: FpButton;
};

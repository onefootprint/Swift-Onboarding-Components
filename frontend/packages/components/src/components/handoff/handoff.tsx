/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';

import useEffectOnce from '../../hooks/use-effect-once';
import useFootprint from '../../hooks/use-footprint';
import useRequest from '../../hooks/use-request';

type HandoffQrCodeProps = {
  className?: string;
  value: string;
  bgColor?: string;
  fgColor?: string;
  imageSettings?: {
    excavate: boolean;
    height: number;
    src: string;
    width: number;
    x?: number;
    y?: number;
  };
  includeMargin?: boolean;
  level?: string;
  size?: number;
  style?: React.CSSProperties;
};

export type HandoffProps = {
  containerClassName?: string;
  renderLoading?: () => JSX.Element;
  qrCodeProps?: HandoffQrCodeProps;
} & React.HTMLAttributes<HTMLDivElement>;

const Handoff = ({
  renderLoading = () => <h2>loading...</h2>,
  className,
  containerClassName,
  style,
  qrCodeProps,
  ...props
}: HandoffProps) => {
  const fp = useFootprint();
  const createMutation = useRequest(fp.createHandoffUrl);

  useEffectOnce(() => {
    createMutation.mutate({});
  });

  if (createMutation.loading) {
    return renderLoading();
  }

  if (createMutation.data && createMutation.data.url) {
    const { url } = createMutation.data;
    return (
      <div className={cx('fp-handoff', containerClassName)} {...props}>
        <QRCodeSVG
          {...qrCodeProps}
          className={cx('fp-handoff-qr-code', className)}
          style={style}
          value={url}
        />
      </div>
    );
  }

  return null;
};

export default Handoff;

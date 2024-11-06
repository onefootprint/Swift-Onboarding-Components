/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantLogoUrl = searchParams.get('logo_url');
  if (!tenantLogoUrl) {
    // biome-ignore lint/complexity/noUselessFragments: ImageResponse requires a React node
    return new ImageResponse(<>Missing tenantLogoUrl</>, {
      width: 1200,
      height: 630,
    });
  }

  return new ImageResponse(
    <div
      style={{
        fontSize: 128,
        background: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://onefootprint.com/background-og.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        gap: 86,
      }}
    >
      <div
        style={{
          background: 'white',
          height: 150,
          width: 150,
          borderRadius: '50%',
          display: 'flex',
          padding: 12,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.04), 0px 6px 16px rgba(0, 0, 0, 0.12)',
        }}
      >
        <img
          height={150}
          width={150}
          src={tenantLogoUrl}
          alt="Tenant Logo"
          style={{
            borderRadius: '50%',
          }}
        />
      </div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 21C11.699 20.9996 11.405 20.9086 11.1563 20.7389C7.47238 18.2381 5.87722 16.5234 4.99738 15.4514C3.12238 13.1663 2.22472 10.8202 2.25003 8.27953C2.27956 5.36813 4.61534 3 7.45691 3C9.52316 3 10.9543 4.16391 11.7877 5.13328C11.8141 5.16368 11.8467 5.18805 11.8833 5.20476C11.92 5.22146 11.9598 5.23011 12 5.23011C12.0403 5.23011 12.0801 5.22146 12.1167 5.20476C12.1534 5.18805 12.186 5.16368 12.2124 5.13328C13.0458 4.16297 14.4769 3 16.5432 3C19.3847 3 21.7205 5.36812 21.75 8.28C21.7753 10.8211 20.8767 13.1672 19.0027 15.4519C18.1228 16.5239 16.5277 18.2386 12.8438 20.7394C12.5951 20.9089 12.3011 20.9998 12 21Z"
          fill="#0E1438"
        />
      </svg>
      <div
        style={{
          padding: 12,
          background: 'white',
          height: 150,
          width: 150,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.04), 0px 6px 16px rgba(0, 0, 0, 0.12)',
        }}
      >
        <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_1458_5)">
            <path
              d="M86.1259 83.3333H97.2346V73.5009C95.6006 74.4484 93.7056 75 91.6794 75C85.5435 75 80.5698 70.0254 80.5698 63.8895C80.5698 57.7527 85.5435 52.7772 91.6794 52.7772C93.7056 52.7772 95.6006 53.3288 97.2346 54.2763V41.6667H52.7917V108.333H72.2355V97.2228C72.2355 89.5516 78.4538 83.3333 86.1259 83.3333Z"
              fill="black"
            />
          </g>
          <defs>
            <clipPath id="clip0_1458_5">
              <rect width="66.6667" height="66.6667" fill="white" transform="translate(41.6667 41.6667)" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>,
    {
      width: 1200,
      height: 600,
    },
  );
}

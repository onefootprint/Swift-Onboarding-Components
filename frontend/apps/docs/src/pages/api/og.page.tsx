import { ImageResponse } from '@vercel/og';
import Image from 'next/image';
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

const font = fetch(new URL('../../assets/DMSans.ttf', import.meta.url)).then(res => res.arrayBuffer());

export default async function handler(req: NextRequest) {
  const fontData = await font;

  try {
    const { searchParams } = new URL(req.url);
    const fallbackTitle = 'Footprint docs';
    const urlTitle = searchParams.get('title');
    const title = urlTitle ? urlTitle.slice(0, 100) : fallbackTitle;

    return new ImageResponse(
      <div
        style={{
          backgroundColor: 'white',
          backgroundSize: '150px 150px',
          height: '100%',
          width: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          flexWrap: 'nowrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            justifyItems: 'center',
          }}
        >
          <Image
            alt="Footprint logo"
            height={96}
            src="data:image/svg+xml,%3Csvg width='56' height='56' viewBox='0 0 56 56' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='56' height='56' rx='2' fill='white'/%3E%3Cpath d='M33.0004 31.75H37.9993V27.3254C37.264 27.7518 36.4113 28 35.4995 28C32.7383 28 30.5001 25.7614 30.5001 23.0003C30.5001 20.2387 32.7383 17.9997 35.4995 17.9997C36.4113 17.9997 37.264 18.248 37.9993 18.6743V13H18V43H26.7497V38.0003C26.7497 34.5482 29.548 31.75 33.0004 31.75Z' fill='black'/%3E%3C/svg%3E"
            style={{ margin: '0 30px' }}
            width={96}
          />
        </div>
        <div
          style={{
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            color: 'black',
            marginTop: 30,
            padding: '0 120px',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
          }}
        >
          {title}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'DM Sans',
            data: fontData,
            style: 'normal',
          },
        ],
      },
    );
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (e: any) {
    console.log(`${e.message}`); // eslint-disable-line no-console
    return new Response('Failed to generate the image', {
      status: 500,
    });
  }
}

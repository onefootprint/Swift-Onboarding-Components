declare module '*.mdx' {
  const content: string;
  export default content;
}

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    hbspt: any;
  }
}

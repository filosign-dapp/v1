declare module "*.svg" {
  const content: string;
  export default content;
}

// // src/types/zstd-codec.d.ts
declare module "zstd-codec" {
  const ZstdCodec: any;
  export { ZstdCodec };
}

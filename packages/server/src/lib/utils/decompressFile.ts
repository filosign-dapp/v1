import { ZstdCodec } from "zstd-codec";
import { readFile, writeFile, stat } from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

const pipe = promisify(pipeline);
const MAX_SIMPLE_SIZE = 12 * 1024 * 1024; // 12 MB

export async function decompressFile(inputPath: string, outputPath?: string) {
  const decompressedFilePath = outputPath || inputPath.replace(/\.zst$/, "");

  const { size: fileSize } = await stat(inputPath);

  return new Promise<void>((resolve, reject) => {
    ZstdCodec.run(async (zstd: any) => {
      try {
        if (fileSize <= MAX_SIMPLE_SIZE) {
          //  Simple decompression
          const inputData = await readFile(inputPath);
          const simple = new zstd.Simple();
          const decompressed = simple.decompress(inputData);

          await writeFile(decompressedFilePath, decompressed);
          console.log("Simple decompression complete:", decompressedFilePath);
          resolve();
        } else {
          // 🌀 Streaming decompression
          const input = createReadStream(inputPath);
          const output = createWriteStream(decompressedFilePath);

          const stream = new zstd.Stream();
          const decompressStream = stream.decompressStream();

          decompressStream.on("error", reject);
          output.on("finish", () => {
            console.log(" Stream decompression complete:", decompressedFilePath);
            resolve();
          });

          input.pipe(decompressStream).pipe(output);
        }
      } catch (err) {
        reject(err);
      }
    });
  });
}

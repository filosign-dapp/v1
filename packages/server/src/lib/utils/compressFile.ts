import { ZstdCodec } from "zstd-codec";
import { readFile, writeFile, stat } from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

const pipe = promisify(pipeline);
const MAX_SIMPLE_SIZE = 12 * 1024 * 1024; // 12 MB

export async function compressFile(inputPath: string, outputPath?: string) {
  const compressedFilePath = outputPath || inputPath + ".zst";

  const { size: fileSize } = await stat(inputPath);

  return new Promise<void>((resolve, reject) => {
    ZstdCodec.run(async (zstd: any) => {
      try {
        if (fileSize <= MAX_SIMPLE_SIZE) {
          // Simple compression ideal for small files
          const inputData = await readFile(inputPath);
          const simple = new zstd.Simple();
          const compressed = simple.compress(inputData);

          await writeFile(compressedFilePath, compressed);
          console.log("✅ Simple compression complete:", compressedFilePath);
          resolve();
        } else {
          // 🌀 Streaming compression used for the larger files 
          const input = createReadStream(inputPath);
          const output = createWriteStream(compressedFilePath);

          const stream = new zstd.Stream();
          const compressStream = stream.compressStream();

          compressStream.on("error", reject);
          output.on("finish", () => {
            console.log("✅ Stream compression complete:", compressedFilePath);
            resolve();
          });

          input.pipe(compressStream).pipe(output);
        }
      } catch (err) {
        reject(err);
      }
    });
  });
}

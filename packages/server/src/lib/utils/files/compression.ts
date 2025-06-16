import { logger } from "../utils";

export async function compressFile(file: File, format: 'gzip' | 'deflate' | "deflate-raw" = 'gzip') {
    if (typeof CompressionStream === 'undefined') {
        throw new Error('Your browser does not support the CompressionStream API.');
    }

    try {
        logger('Compressing file...', { format });
        const initTime = new Date().toISOString();
        const compressionStream = new CompressionStream(format);
        const fileStream = file.stream();
        const compressedStream = fileStream.pipeThrough(compressionStream);
        const compressedArrayBuffer = await new Response(compressedStream).arrayBuffer();

        const compressedSize = compressedArrayBuffer.byteLength;
        const originalSize = file.size;
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        const timeTaken = new Date().getTime() - new Date(initTime).getTime();
        logger('Finished compressing file...', {
            originalSize: `${originalSize} bytes`,
            compressedSize: `${compressedSize} bytes`,
            compressionRatio: `${compressionRatio}%`,
            timeTaken: `${timeTaken}ms`,
        });
        return compressedArrayBuffer;
    } catch (error) {
        throw new Error(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function decompressFile(compressedData: ArrayBuffer, format: 'gzip' | 'deflate' | "deflate-raw" = 'gzip') {
    if (typeof DecompressionStream === 'undefined') {
        throw new Error('Your browser does not support the DecompressionStream API.');
    }

    try {
        logger('Decompressing file...', { format });
        const initTime = new Date().toISOString();
        const decompressionStream = new DecompressionStream(format);
        const compressedStream = new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array(compressedData));
                controller.close();
            }
        });
        const decompressedStream = compressedStream.pipeThrough(decompressionStream);
        const decompressedArrayBuffer = await new Response(decompressedStream).arrayBuffer();

        const decompressedSize = decompressedArrayBuffer.byteLength;
        const compressedSize = compressedData.byteLength;
        const decompressionRatio = ((compressedSize - decompressedSize) / compressedSize * 100).toFixed(1);
        const timeTaken = new Date().getTime() - new Date(initTime).getTime();
        logger('Finished decompressing file...', {
            timeTaken: `${timeTaken}ms`,
            decompressedSize: `${decompressedSize} bytes`,
            compressedSize: `${compressedSize} bytes`,
            decompressionRatio: `${decompressionRatio}%`,
        });
        return decompressedArrayBuffer;
    } catch (error) {
        throw new Error(`Decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
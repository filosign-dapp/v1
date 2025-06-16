import { logger } from "../utils";

const COMPRESSION_EXCEPTION_LIST = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.heic', '.heif',
    '.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.m4v', '.3gp',
    '.mp3', '.aac', '.ogg', '.m4a', '.flac', '.wma', '.opus',
    '.zip', '.rar', '.7z', '.tar.gz', '.tgz', '.bz2', '.xz', '.gz',
    '.pdf', '.docx', '.xlsx', '.pptx',
    '.lz4', '.zst', '.br', '.lzma'
];

function shouldSkipCompression(filename: string): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    if (!extension) return false;
    
    const fullExtension = `.${extension}`;
    return COMPRESSION_EXCEPTION_LIST.includes(fullExtension);
}

export async function compressFile(file: File, format: 'gzip' | 'deflate' | "deflate-raw" = 'gzip') {
    if (shouldSkipCompression(file.name)) {
        logger('Skipping compression for already compressed file type', { 
            filename: file.name,
            size: `${file.size} bytes`
        });
        return await file.arrayBuffer();
    }

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

export async function decompressFile(compressedData: ArrayBuffer, originalFilename: string, format: 'gzip' | 'deflate' | "deflate-raw" = 'gzip') {
    if (originalFilename && shouldSkipCompression(originalFilename.replace('.enc', ''))) {
        logger('Skipping decompression for already compressed file type', { 
            filename: originalFilename,
            size: `${compressedData.byteLength} bytes`
        });
        return compressedData;
    }

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
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function createDownloadLink(cid: string, name: string, secretKey: string) {
    const origin = window.location.origin
    const encodedName = encodeURIComponent(name)
    const encodedKey = encodeURIComponent(secretKey)
    return `${origin}/#/download/${cid}?name=${encodedName}&key=${encodedKey}`
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function sanitizeFilename(filename: string): string {
    return filename.replace(/(sql|javascript|html|php|shell|command|bash)/gi, '')
}

export function basicFileChecks(file: File) {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Maximum file size is 10MB.')
    }
}

export function sanitizeFile(file: File) {
    const sanitizedFilename = sanitizeFilename(file.name)
    if (sanitizedFilename.length > 255) {
        throw new Error('File name is too long.')
    }

    return new File([file], sanitizedFilename, { type: file.type })
}
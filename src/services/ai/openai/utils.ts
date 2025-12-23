/**
 * Client-safe utility functions for file validation
 * These can be used in client components
 */

export const SUPPORTED_FILE_TYPES = {
  // Documents
  PDF: 'application/pdf',
  
  // Images (vision API)
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  
  // Text files
  TEXT: 'text/plain',
  TEXT_CSV: 'text/csv',
  
  // Office documents (may need conversion to PDF first)
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
} as const;

export const SUPPORTED_EXTENSIONS = [
  '.pdf',
  '.jpg', '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.txt',
  '.csv',
] as const;

/**
 * Validates if a MIME type is supported
 */
export function isSupportedMimeType(mimeType: string): boolean {
  const supportedTypes = Object.values(SUPPORTED_FILE_TYPES) as readonly string[];
  return supportedTypes.includes(mimeType);
}

/**
 * Validates if a file extension is supported
 */
export function isSupportedExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Gets MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string | null {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  const extensionMap: Record<string, string> = {
    '.pdf': SUPPORTED_FILE_TYPES.PDF,
    '.jpg': SUPPORTED_FILE_TYPES.JPEG,
    '.jpeg': SUPPORTED_FILE_TYPES.JPEG,
    '.png': SUPPORTED_FILE_TYPES.PNG,
    '.gif': SUPPORTED_FILE_TYPES.GIF,
    '.webp': SUPPORTED_FILE_TYPES.WEBP,
    '.txt': SUPPORTED_FILE_TYPES.TEXT,
    '.csv': SUPPORTED_FILE_TYPES.TEXT_CSV,
  };
  
  return extensionMap[ext] || null;
}


const typePath: Record<string, string[]> = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".svg"],
  audio: [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"],
  video: [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv"],
  script: [".txt", ".doc", ".docx", ".pdf", ".rtf"]
};

export function isValidExtensionForType(type: keyof typeof typePath, extension: string): boolean {
  return typePath[type]?.includes(extension) ?? false;
}

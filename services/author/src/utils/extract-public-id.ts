
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    const parts = cloudinaryUrl.split("/upload/");
    if (parts.length !== 2) return null;

    const rest = parts[1];
    const publicId = rest.substring(0, rest.lastIndexOf("."));
    return publicId;
  } catch {
    return null;
  }
}

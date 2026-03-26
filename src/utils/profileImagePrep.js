import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/** Longest edge in pixels (profile avatars — enough for ~2× displays). */
export const PROFILE_IMAGE_MAX_EDGE = 512;

/** JPEG quality after resize (lower = smaller file). */
export const PROFILE_IMAGE_JPEG_QUALITY = 0.65;

/** Reject picks larger than this before loading into the manipulator (bytes). */
export const PROFILE_IMAGE_MAX_PICK_BYTES = 8 * 1024 * 1024;

export function getProfileMaxPickSizeLabel() {
  return `${PROFILE_IMAGE_MAX_PICK_BYTES / (1024 * 1024)} MB`;
}

/**
 * @param {number | null | undefined} fileSize — from ImagePicker asset; may be undefined on some platforms
 */
export function assertProfilePickSizeOk(fileSize) {
  if (fileSize == null || !Number.isFinite(fileSize)) return;
  if (fileSize > PROFILE_IMAGE_MAX_PICK_BYTES) {
    throw new Error(
      `This image is too large (max ${getProfileMaxPickSizeLabel()}). Pick a smaller photo or take a new one.`
    );
  }
}

/**
 * Resize so the longest side is at most PROFILE_IMAGE_MAX_EDGE, re-encode as JPEG.
 * @param {string} uri — local file uri
 * @param {{ width?: number; height?: number }} dimensions — from picker asset when available
 * @returns {Promise<string>} uri of the new JPEG file
 */
export async function prepareProfileImageForUpload(uri, dimensions = {}) {
  const w = dimensions.width;
  const h = dimensions.height;
  const maxEdge = PROFILE_IMAGE_MAX_EDGE;

  const actions = [];

  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    const longer = Math.max(w, h);
    if (longer > maxEdge) {
      if (w >= h) {
        actions.push({ resize: { width: maxEdge } });
      } else {
        actions.push({ resize: { height: maxEdge } });
      }
    }
  } else {
    actions.push({ resize: { width: maxEdge } });
  }

  // Re-encode to JPEG even when no resize (e.g. already small); rotate 0 is a no-op transform.
  if (actions.length === 0) {
    actions.push({ rotate: 0 });
  }

  const result = await manipulateAsync(uri, actions, {
    compress: PROFILE_IMAGE_JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  return result.uri;
}

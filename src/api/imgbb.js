const IMGBB_API_KEY = '5bdcb96655462459d117ee1361223929';

function guessMimeType(uri) {
  const u = String(uri || '').toLowerCase();
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.webp')) return 'image/webp';
  if (u.endsWith('.heic')) return 'image/heic';
  return 'image/jpeg';
}

export async function uploadToImgbb({ uri, mimeType } = {}) {
  if (!uri) throw new Error('Image uri is required');

  const type = mimeType || guessMimeType(uri);
  const formData = new FormData();
  formData.append('image', {
    uri,
    name: `profile_${Date.now()}.jpg`,
    type,
  });

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || 'Image upload failed';
    throw new Error(msg);
  }

  const url = data?.data?.display_url || data?.data?.url || null;
  if (!url) throw new Error('No image URL returned from imgbb');
  return { url, raw: data };
}


// Aturan gambar unggahan, sama dengan backend (mimes:jpg,jpeg,png | max:10240 KB).
export const IMAGE_ACCEPT = 'image/jpeg,image/jpg,image/png';
export const IMAGE_MAX_MB = 10;
export const IMAGE_HINT = `Maks ${IMAGE_MAX_MB}MB • JPG, JPEG, PNG`;

const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

/** Mengembalikan pesan error (string) bila file tidak valid, atau null bila lolos. */
export const validateImageFile = (file) => {
  if (!VALID_TYPES.includes(file.type)) {
    return 'Format gambar harus JPG, JPEG, atau PNG';
  }
  if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
    return `Ukuran gambar maksimal ${IMAGE_MAX_MB}MB`;
  }
  return null;
};

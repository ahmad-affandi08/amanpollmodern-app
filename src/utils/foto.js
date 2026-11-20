/**
 * Perkecil foto (sisi terpanjang `maks` px) dan ubah ke data URL JPEG, supaya foto kamera HP
 * (beberapa MB) cukup ringan dikirim bersama form. Gagal dibaca -> melempar galat.
 */
export function fotoKeDataUrl(file, { maks = 1280, kualitas = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const skala = Math.min(1, maks / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * skala);
      canvas.height = Math.round(img.height * skala);
      const ctx = canvas.getContext('2d');
      // PNG transparan jadi hitam saat dijadikan JPEG; beri latar putih.
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', kualitas));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Foto tidak dapat dibaca'));
    };
    img.src = url;
  });
}

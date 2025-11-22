// src/utils/imageUtils.ts

export const sanitizeFileName = (fileName: string): string => {
  // Remove caracteres especiais e espaços para evitar erro 400 no Supabase Storage
  const name = fileName.substring(0, fileName.lastIndexOf('.'));
  const ext = fileName.substring(fileName.lastIndexOf('.') + 1);
  const sanitized = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  return `${sanitized}-${Date.now()}.${ext}`;
};

export const resizeImage = (file: File, maxWidth = 800, maxHeight = 800): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      let width = image.width;
      let height = image.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Falha ao criar contexto do canvas'));
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Falha ao processar imagem'));
        }
      }, file.type, 0.85); // 85% de qualidade JPEG/WEBP
    };
    image.onerror = (error) => reject(error);
  });
}; 
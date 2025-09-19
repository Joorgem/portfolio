// Cloudinary Collection Configuration
// Collection URL: https://collection.cloudinary.com/dkdmvvgg4/4c582723cfa42f87bd0cc2bfb6e68d26

interface CloudinaryImage {
  id: string;
  src: string;
  caption?: string;
}

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
  cloudName: 'dkdmvvgg4',
  collectionId: '4c582723cfa42f87bd0cc2bfb6e68d26',
  baseUrl: 'https://res.cloudinary.com/dkdmvvgg4/image/upload'
};

/**
 * Gera URL otimizada do Cloudinary com transformações automáticas
 * @param publicId - ID público da imagem no Cloudinary
 * @param options - Opções de transformação
 */
function generateCloudinaryUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  crop?: string;
  optimized?: boolean;
}): string {
  const {
    width = 800,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    optimized = true
  } = options || {};

  // Transformações otimizadas para galeria de fotos
  const transformations = [
    `f_${format}`,     // Formato automático (WebP/AVIF quando suportado, JPEG como fallback)
    `q_${quality}`,    // Qualidade automática baseada no conteúdo
    `w_${width}`,      // Largura máxima
    `c_${crop}`        // Crop: limit = mantém proporção, não amplia
  ];

  // Otimizações adicionais para melhor performance
  if (optimized) {
    transformations.push(
      'fl_progressive',  // JPEG progressivo para carregamento mais rápido
      'fl_immutable_cache' // Cache imutável para melhor CDN performance
    );
  }

  return `${CLOUDINARY_CONFIG.baseUrl}/${transformations.join(',')}/${publicId}`;
}

/**
 * ✅ FOTOS REAIS DO JORGE - Cloudinary Collection
 * Extraídas das URLs fornecidas e otimizadas para performance
 */
const YOUR_PHOTO_PUBLIC_IDS = [
  // Suas fotos reais da collection do Cloudinary
  'WhatsApp_Image_2025-09-19_at_17.16.43_pggm7q',
  'WhatsApp_Image_2025-09-19_at_17.12.09_1_bxf1dw',
  'WhatsApp_Image_2025-09-19_at_17.12.09_eikn4e',
  'WhatsApp_Image_2025-09-19_at_17.12.09_2_osjuyz',
  'IMG_0149_ekgqxi',
  'IMG_0081_tfrjve',
  'IMG_0130_lnvrrm',
  'IMG_0552_sr69bd',
  'IMG_0888_wc9fm2',
  'IMG_0774_dp2qih',
  '0a397522-a619-4c22-ac46-2d9b3428e191_ypvdmy',
  '74BF59AC-2B7E-43AF-8378-58F495E291E4_xpt19p',
  'EED736DD-B28B-4535-AB63-C7CEE928869A_ku992u',
  'IMG_0342_rkjh1z',
  'IMG_0250_pgwimg',
  'IMG_0626_hse87m',
  'IMG_0720_ibhxph',
  'IMG_0237_waigu3',
  'IMG_0214_tsxqyz',
  'IMG_0281_kod9vd',
  'IMG_0536_lu3oys'
];

// Generate optimized URLs for all photos
const cloudinaryPhotos: CloudinaryImage[] = YOUR_PHOTO_PUBLIC_IDS.map((publicId, index) => ({
  id: `photo${index + 1}`,
  src: generateCloudinaryUrl(publicId, {
    width: 800,
    quality: 'auto',
    format: 'auto'
  }),
  caption: `Foto ${index + 1}`
}));

// Only export what's actually used
export const personalPhotos = cloudinaryPhotos;
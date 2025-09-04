// Personal photo gallery configuration
import { processImageUrl } from '../utils/imageHosting';

// ========================================
// COMO ADICIONAR SUAS FOTOS (SUPER FÁCIL!)
// ========================================
// 
// OPÇÃO 1: IMGUR (MAIS FÁCIL - RECOMENDADO) 
// 1. Vá para https://imgur.com
// 2. Clique em "New post" 
// 3. Arraste todas suas fotos de uma vez
// 4. Após upload, copie os links das imagens
// 5. Cole os links abaixo
//
// OPÇÃO 2: GOOGLE DRIVE (pode ter problemas)
// Se ainda quiser tentar com Google Drive,
// cole os links normalmente que tentaremos converter
//
// OPÇÃO 3: CLOUDINARY (melhor qualidade)
// 1. Conta grátis em cloudinary.com
// 2. Upload no Media Library
// 3. Cole as URLs aqui

const imageUrls = [
  // SEUS LINKS DO GOOGLE DRIVE (vamos tentar converter)
  'https://drive.google.com/file/d/1ICzqAWCXyVvjEBw4ppxQaMH6Tua1EkDV/view?usp=sharing',
  'https://drive.google.com/file/d/1FJle2Ci8bhWAZUQmDm8WFgmFWHq9x4wP/view?usp=sharing',
  'https://drive.google.com/file/d/12mGIaMGOINRik16h3tWsB8wMr-6VHMOc/view?usp=sharing',
  'https://drive.google.com/file/d/1SbJaBrXl2Wj3df8vnAxHItYlv-fqsdUr/view?usp=sharing',
  'https://drive.google.com/file/d/1NweubhN44fv9u0plGPhJyrhZFUeKgvST/view?usp=sharing',
  'https://drive.google.com/file/d/13sG6mVJGiYVa3ixPZt2XT272XpZyLyq9/view?usp=sharing',
  'https://drive.google.com/file/d/1naJFYH35hTNHM6osWmFgFQOByw9EkW_c/view?usp=sharing',
  'https://drive.google.com/file/d/1Il7LgUop32EbD99vRWrzzFntnqz0ttDv/view?usp=sharing',
  'https://drive.google.com/file/d/1NKz_Gmxgv4Y_Sb5JM7XTbAtrTmBj3Fzb/view?usp=sharing',
  'https://drive.google.com/file/d/1P4DlOAWG3yY5YWlD5Ju3jPIJ_B-nlIi0/view?usp=sharing',
  'https://drive.google.com/file/d/17QMTVAbpuCs-Dfn8dUm9SWkV6u7r5De0/view?usp=sharing',
  'https://drive.google.com/file/d/1uy0E-n4X04fG_x5ymOY03wSZGnPbJYUk/view?usp=sharing',
  'https://drive.google.com/file/d/1VGA05-fxxnQfUKbKs4dYXrZHYuKQ7ChM/view?usp=sharing',
  'https://drive.google.com/file/d/1_O50RctKZGEz3bIJCrjOL7C7iWQRYsis/view?usp=sharing',
  'https://drive.google.com/file/d/1uUw4P3HhQCRiIsYloqSb47X_UIEEm6Ug/view?usp=sharing',
  'https://drive.google.com/file/d/1iui0E13tGV92EVGqw15cwcm5oqlVhscN/view?usp=sharing',
  'https://drive.google.com/file/d/1aGVBif1ApQbWluGFtSW8UoSexYs39AT_/view?usp=sharing',
  'https://drive.google.com/file/d/1x43Pa6IkV76PZOZ13lzVcsPos-QUY-o6/view?usp=sharing',
  'https://drive.google.com/file/d/1wYG3xQseFOZsgDp8b9YljyIdtV-0_zQE/view?usp=sharing',
  'https://drive.google.com/file/d/1D6P18IWxUSVECdlu-8wji5cxSK8vWJ5l/view?usp=sharing',
  'https://drive.google.com/file/d/12LINW0ZlBC6Ux2IeXMxRE0iXKFCCG7cc/view?usp=sharing',
  'https://drive.google.com/file/d/1ssIjLb0VsbD9g20kXtroagHOqXoHLNSD/view?usp=sharing',
  'https://drive.google.com/file/d/1PtV4L-_wAzjMKtMqjpoEpEDqHHiidDA4/view?usp=sharing',
  'https://drive.google.com/file/d/1-70N4ZZA0OTEkle3ee0EQBVh1lrBOkfS/view?usp=sharing',
  'https://drive.google.com/file/d/1pzevw6A1eUdUl8OxPbQa5FyJaz_wzc46/view?usp=sharing',
  'https://drive.google.com/file/d/1upohXDt-pQ4BPKDT9XKYyZakQ1SgmNaB/view?usp=sharing',
  'https://drive.google.com/file/d/1gLxn3PpGOzzkLifLWHIRWJ_BlyTt9ckO/view?usp=sharing',
  'https://drive.google.com/file/d/1vT-uf2mZOlHJSvK2ZknyNuKAxF4SAJd_/view?usp=sharing',
  'https://drive.google.com/file/d/1H3NXB88jB4hKRtSpFT82Oqkjpi3p0quZ/view?usp=sharing',
  'https://drive.google.com/file/d/1BctXSXVb5U6N7rJKjvSN3qqWuhTQ0kjX/view?usp=sharing',
  'https://drive.google.com/file/d/1IWXcLNctbyndp_EycVhF8RomM9zf-W4P/view?usp=sharing',
  'https://drive.google.com/file/d/1osFuRTYUZ0a1AswMEvti3QxxIBCg-zJj/view?usp=sharing',
  'https://drive.google.com/file/d/13KJ0HLGAQ_bMX-drhP2fb63bO7p8yFGg/view?usp=sharing',
];

// Processa automaticamente todas as URLs
export const personalPhotos = imageUrls
  .map((url, index) => ({
    id: `photo${index + 1}`,
    url: processImageUrl(url),
    caption: '' // Sem legendas
  }));

// Fotos de teste (só aparecem se você não adicionar suas fotos)
export const placeholderPhotos = personalPhotos.length === 0 ? [
  {
    id: 'demo1',
    url: '/images/test-image.svg',
    caption: ''
  },
  {
    id: 'demo2',
    url: '/images/test-image.svg',
    caption: ''
  },
  {
    id: 'demo3',
    url: '/images/test-image.svg',
    caption: ''
  }
] : [];

// ========================================
// PROBLEMAS COM GOOGLE DRIVE?
// ========================================
// O Google Drive tem problemas de CORS que impedem
// o carregamento das imagens. 
//
// SOLUÇÃO RECOMENDADA: Use o Imgur!
// 
// 1. Vá para imgur.com
// 2. Arraste todas suas 33 fotos de uma vez
// 3. Copie os links diretos (formato: https://i.imgur.com/xxx.jpg)
// 4. Substitua os links acima
//
// É rápido, grátis e funciona perfeitamente!
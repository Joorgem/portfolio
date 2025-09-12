// Image Hosting Utility - Suporta múltiplos serviços sem CORS
// Recomendado: Imgur, Cloudinary, ou Uploadcare

interface ImageService {
  name: string;
  detectPattern: RegExp;
  getDirectUrl: (_url: string) => string;
}

// Serviços de hospedagem de imagem que funcionam sem CORS
const imageServices: ImageService[] = [
  {
    name: 'Imgur',
    detectPattern: /imgur\.com/,
    getDirectUrl: (url: string) => {
      // Extrai ID da imagem do Imgur
      const patterns = [
        /imgur\.com\/([a-zA-Z0-9]+)(?:\.|$)/,
        /i\.imgur\.com\/([a-zA-Z0-9]+)(?:\.|$)/,
        /imgur\.com\/gallery\/([a-zA-Z0-9]+)/,
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          // Retorna URL direta do Imgur (large size)
          return `https://i.imgur.com/${match[1]}.jpg`;
        }
      }
      return url;
    }
  },
  {
    name: 'Cloudinary',
    detectPattern: /res\.cloudinary\.com/,
    getDirectUrl: (url: string) => {
      // Cloudinary já fornece URLs diretas
      // Podemos adicionar transformações se necessário
      if (url.includes('res.cloudinary.com')) {
        // Adiciona otimizações automáticas
        return url.replace('/upload/', '/upload/f_auto,q_auto,w_1000/');
      }
      return url;
    }
  },
  {
    name: 'Google Drive (Tentativa)',
    detectPattern: /drive\.google\.com/,
    getDirectUrl: (url: string) => {
      // Última tentativa com Google Drive usando lh3
      const patterns = [
        /\/file\/d\/([a-zA-Z0-9-_]+)/,
        /id=([a-zA-Z0-9-_]+)/,
        /\/d\/([a-zA-Z0-9-_]+)/,
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          // Usa o formato lh3 que às vezes funciona
          return `https://lh3.googleusercontent.com/d/${match[1]}=w1000`;
        }
      }
      return url;
    }
  },
  {
    name: 'Direct URL',
    detectPattern: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
    getDirectUrl: (_url: string) => _url
  }
];

/**
 * Processa qualquer URL de imagem e retorna a melhor versão para uso sem CORS
 */
export function processImageUrl(_url: string): string {
  // Se já é uma URL direta de imagem, retorna como está
  if (_url.startsWith('http://localhost') || _url.startsWith('/')) {
    return _url;
  }

  // Tenta cada serviço
  for (const service of imageServices) {
    if (service.detectPattern.test(_url)) {
      return service.getDirectUrl(_url);
    }
  }

  // Se não reconhecer o serviço, retorna a URL original
  return _url;
}

/**
 * Instruções para hospedar imagens sem problemas de CORS
 * 
 * OPÇÃO 1: Imgur (Recomendado - Mais Fácil)
 * 1. Vá para https://imgur.com
 * 2. Clique em "New post" (não precisa conta)
 * 3. Arraste suas imagens
 * 4. Após upload, clique direito na imagem > "Copiar endereço da imagem"
 * 5. Use a URL no formato: https://i.imgur.com/XXXXXX.jpg
 * 
 * OPÇÃO 2: Cloudinary (Profissional - Melhor Qualidade)
 * 1. Crie conta grátis em https://cloudinary.com
 * 2. Faça upload das imagens no Media Library
 * 3. Copie a URL fornecida
 * 4. O sistema otimizará automaticamente
 * 
 * OPÇÃO 3: PostImage
 * 1. Vá para https://postimages.org
 * 2. Upload sem conta
 * 3. Escolha "Direct Link" após upload
 * 
 * OPÇÃO 4: ImgBB
 * 1. Vá para https://imgbb.com
 * 2. Upload até 32MB por imagem
 * 3. Use o "Direct link" fornecido
 */

// Exemplos de URLs que funcionam
export const workingImageExamples = [
  'https://i.imgur.com/example.jpg',
  'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  'https://i.postimg.cc/example/image.jpg',
  'https://i.ibb.co/example/image.jpg'
];
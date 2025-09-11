// Google Drive Photos Utility
// Converte links compartilhados do Google Drive em URLs diretas

/**
 * Converte um link compartilhado do Google Drive em URL direta
 * @param shareLink - Link compartilhado do Google Drive
 * @returns URL direta ou null se não for possível extrair o ID
 */
export function convertShareLinkToDirectUrl(shareLink: string): string | null {
  // Extrai o ID do arquivo de diferentes formatos de URL do Google Drive
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,  // https://drive.google.com/file/d/FILE_ID/view
    /id=([a-zA-Z0-9-_]+)/,          // https://drive.google.com/open?id=FILE_ID
    /\/d\/([a-zA-Z0-9-_]+)/,        // https://drive.google.com/uc?id=FILE_ID
  ];

  for (const pattern of patterns) {
    const match = shareLink.match(pattern);
    if (match && match[1]) {
      // Usa o formato de thumbnail que funciona melhor com CORS
      // Este formato é mais confiável e evita problemas de Tracking Prevention
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
  }

  // Se não conseguir extrair o ID, retorna null
  return null;
}
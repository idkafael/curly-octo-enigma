import { useState, useEffect } from 'react';

/**
 * Componente de imagem com cache busting automático
 * Garante que imagens atualizadas sejam sempre carregadas
 * 
 * @param {string} src - Caminho da imagem (ex: /images/banner.jpg)
 * @param {string} alt - Texto alternativo
 * @param {string} className - Classes CSS
 * @param {object} style - Estilos inline
 * @param {function} onError - Handler de erro
 * @param {object} props - Outras props do elemento img
 */
export default function ImageWithCacheBust({ 
  src, 
  alt, 
  className = '', 
  style = {},
  onError,
  ...props 
}) {
  const [imageVersion, setImageVersion] = useState(Date.now());
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    // Função global para forçar atualização de todas as imagens
    if (typeof window !== 'undefined') {
      window.forceAllImagesReload = () => {
        setImageVersion(Date.now());
      };
      
      // Função para forçar atualização de uma imagem específica
      window.forceImageReload = (imagePath) => {
        if (imagePath === src || !imagePath) {
          setImageVersion(Date.now());
        }
      };
    }
  }, [src]);

  const handleError = (e) => {
    // Se falhar com cache busting, tenta sem
    if (e.target.src.includes('?v=')) {
      setImageSrc(src);
      e.target.src = src;
    }
    
    // Chama handler customizado se fornecido
    if (onError) {
      onError(e);
    }
  };

  // Adiciona cache busting à URL
  const srcWithCache = imageSrc.includes('?') 
    ? `${imageSrc}&v=${imageVersion}` 
    : `${imageSrc}?v=${imageVersion}`;

  return (
    <img
      src={srcWithCache}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      {...props}
    />
  );
}






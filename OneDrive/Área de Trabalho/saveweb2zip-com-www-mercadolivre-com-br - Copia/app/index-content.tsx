'use client'

import { useEffect, useState } from 'react'

interface IndexContentProps {
  htmlContent: string
}

export default function IndexContent({ htmlContent }: IndexContentProps) {
  const [bodyContent, setBodyContent] = useState<string>('')
  const [headContent, setHeadContent] = useState<string>('')

  useEffect(() => {
    if (!htmlContent) {
      return
    }

    try {
      // Extrair apenas o conteúdo do body, removendo as tags html/head/body
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      
      // Verificar se há erros de parsing
      const parserError = doc.querySelector('parsererror')
      if (parserError) {
        console.error('HTML parsing error:', parserError.textContent)
        return
      }
      
      // Pegar todo o conteúdo do body
      const body = doc.body?.innerHTML || ''
      setBodyContent(body)
      
      // Extrair todo o conteúdo do head (CSS, links, meta tags, etc.)
      const headElements = Array.from(doc.head.children)
      const headHTML = headElements.map(el => el.outerHTML).join('\n')
      setHeadContent(headHTML)
      
      // Aplicar elementos do head dinamicamente
      headElements.forEach(element => {
        const tagName = element.tagName.toLowerCase()
        
        // Ignorar elementos que já existem
        if (tagName === 'title') return // Next.js já tem title
        
        try {
          if (tagName === 'style') {
            // Adicionar estilos inline
            const style = document.createElement('style')
            style.innerHTML = element.innerHTML
            if (!document.head.querySelector(`style[data-injected="true"]`)) {
              style.setAttribute('data-injected', 'true')
              document.head.appendChild(style)
            }
          } else if (tagName === 'link') {
            // Adicionar links (CSS, fonts, etc.)
            const link = document.createElement('link')
            const rel = element.getAttribute('rel')
            const href = element.getAttribute('href')
            const as = element.getAttribute('as')
            const type = element.getAttribute('type')
            
            if (rel) link.rel = rel
            if (href) link.href = href
            if (as) link.setAttribute('as', as)
            if (type) link.type = type
            
            // Verificar se já existe
            const existingLink = document.head.querySelector(`link[href="${href}"]`)
            if (!existingLink) {
              document.head.appendChild(link)
            }
          } else if (tagName === 'script') {
            // Adicionar scripts
            const src = element.getAttribute('src')
            if (src) {
              const script = document.createElement('script')
              script.src = src
              script.async = element.hasAttribute('async')
              script.defer = element.hasAttribute('defer')
              const nonce = element.getAttribute('nonce')
              if (nonce) script.setAttribute('nonce', nonce)
              
              if (!document.head.querySelector(`script[src="${src}"]`)) {
                document.head.appendChild(script)
              }
            } else if (element.innerHTML) {
              const script = document.createElement('script')
              script.innerHTML = element.innerHTML
              const nonce = element.getAttribute('nonce')
              if (nonce) script.setAttribute('nonce', nonce)
              document.head.appendChild(script)
            }
          } else if (tagName === 'meta') {
            // Adicionar meta tags
            const meta = document.createElement('meta')
            Array.from(element.attributes).forEach(attr => {
              meta.setAttribute(attr.name, attr.value)
            })
            
            const name = element.getAttribute('name') || element.getAttribute('property')
            const existingMeta = name 
              ? document.head.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
              : null
            
            if (!existingMeta) {
              document.head.appendChild(meta)
            }
          }
        } catch (error) {
          console.error(`Error adding ${tagName}:`, error)
        }
      })
    } catch (error) {
      console.error('Error processing HTML:', error)
    }
  }, [htmlContent])

  if (!htmlContent) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        background: '#fff'
      }}>
        <p style={{
          fontSize: '20px',
          color: 'rgba(0,0,0,.9)',
          marginBottom: '24px',
          fontWeight: 400
        }}>
          Carregando...
        </p>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e6e6e6',
          borderTop: '4px solid #3483fa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      {/* Injetar conteúdo do head */}
      {headContent && (
        <div dangerouslySetInnerHTML={{ __html: headContent }} style={{ display: 'none' }} />
      )}
      {/* Renderizar conteúdo do body */}
      <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
    </>
  )
}

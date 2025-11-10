# Como Atualizar Imagens

## Regra de Nomenclatura

Todas as imagens devem seguir nomes padrão, independente do formato do arquivo:

### Imagens Principais:
- **Banner**: Sempre use `banner.jpg` (aceita .jpg, .png, .jpeg, .webp)
- **Perfil**: Sempre use `perfil.jpg`
- **Favicon**: Sempre use `favicon.png`

## Como Atualizar uma Imagem

1. **Substitua o arquivo existente** mantendo o mesmo nome:
   - Para atualizar o banner: substitua `public/images/banner.jpg`
   - O sistema automaticamente usará o novo arquivo

2. **Formatos aceitos**:
   - Banner: `.jpg`, `.png`, `.jpeg`, `.webp` (todos serão servidos como `banner.jpg`)
   - Perfil: `.jpg`, `.png`, `.jpeg`, `.webp`
   - Favicon: `.png`, `.ico`

3. **Cache do navegador**:
   - Após atualizar, use `Ctrl + F5` para limpar o cache
   - Ou adicione `?v=2` na URL da imagem para forçar atualização

## Exemplo

Se você tem uma nova imagem `novo-banner.png`:
1. Renomeie para `banner.jpg` (ou copie como `banner.jpg`)
2. Substitua o arquivo em `public/images/banner.jpg`
3. Recarregue a página (Ctrl + F5)

O sistema automaticamente usará a nova imagem!






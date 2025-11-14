# Configuração do Storage no Supabase para Upload de Imagens

Este guia explica como configurar o bucket de storage no Supabase para permitir upload de imagens dos itens do menu.

## Passo 1: Criar o Bucket

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Clique no botão **"New bucket"** ou **"Create bucket"**
5. Configure o bucket:
   - **Name**: `menu-images` (deve ser exatamente este nome)
   - **Public bucket**: ✅ **Marque como público** (para que as imagens sejam acessíveis publicamente)
   - **File size limit**: 5 MB (ou o tamanho que preferir)
   - **Allowed MIME types**: `image/*` (ou especifique: `image/jpeg,image/png,image/webp,image/gif`)

## Passo 2: Configurar Políticas de Acesso (RLS Policies)

Após criar o bucket, você precisa configurar as políticas de segurança:

### 2.1. Política para Upload (INSERT)

1. No bucket `menu-images`, clique em **"Policies"** ou **"RLS Policies"**
2. Clique em **"New Policy"** ou **"Add Policy"**
3. Selecione **"Create a policy from scratch"**
4. Configure:
   - **Policy name**: `Allow authenticated users to upload images`
   - **Allowed operation**: `INSERT`
   - **Policy definition**: Use o seguinte SQL:

```sql
(
  bucket_id = 'menu-images'::text
)
AND
(
  auth.role() = 'authenticated'::text
)
AND
(
  (storage.foldername(name))[1] IN ('menu-items', 'logos', 'covers')
)
```

**Nota**: Esta política permite upload nas pastas `menu-items`, `logos` e `covers`.

### 2.2. Política para Leitura (SELECT) - Público

1. Crie outra política:
   - **Policy name**: `Allow public to read images`
   - **Allowed operation**: `SELECT`
   - **Policy definition**:

```sql
bucket_id = 'menu-images'::text
```

### 2.3. Política para Atualização (UPDATE)

1. Crie outra política:
   - **Policy name**: `Allow authenticated users to update images`
   - **Allowed operation**: `UPDATE`
   - **Policy definition**:

```sql
(
  bucket_id = 'menu-images'::text
)
AND
(
  auth.role() = 'authenticated'::text
)
```

### 2.4. Política para Exclusão (DELETE)

1. Crie outra política:
   - **Policy name**: `Allow authenticated users to delete images`
   - **Allowed operation**: `DELETE`
   - **Policy definition**:

```sql
(
  bucket_id = 'menu-images'::text
)
AND
(
  auth.role() = 'authenticated'::text
)
```

## Passo 3: Verificar Configuração

Após configurar, teste o upload:

1. Acesse a página **Itens do Menu** no admin
2. Clique em **"Novo Item"**
3. Tente fazer upload de uma imagem usando o botão **"Upload"**
4. Se funcionar, a URL da imagem será preenchida automaticamente

## Alternativa: Usar URLs Externas

Se preferir não configurar o storage agora, você pode:

1. Usar URLs de imagens externas (ex: Imgur, Cloudinary, etc.)
2. Colar a URL diretamente no campo **"URL da Imagem"**
3. O sistema funcionará normalmente

## Troubleshooting

### Erro: "Bucket not found"
- Verifique se o nome do bucket é exatamente `menu-images`
- Certifique-se de que o bucket foi criado

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS foram criadas corretamente
- Certifique-se de que o usuário está autenticado

### Erro: "The resource already exists"
- O arquivo já existe. O sistema gera nomes únicos, mas se houver conflito, tente novamente

### Imagens não aparecem
- Verifique se o bucket está marcado como **público**
- Verifique se a política de SELECT permite acesso público

## Estrutura de Pastas

O sistema organiza as imagens na seguinte estrutura:
```
menu-images/
  ├── menu-items/          # Imagens dos itens do menu
  │   ├── 1234567890-abc123.jpg
  │   ├── 1234567891-def456.png
  │   └── ...
  ├── logos/               # Logos do restaurante
  │   ├── 1234567892-xyz789.png
  │   └── ...
  └── covers/              # Imagens de capa do menu
      ├── 1234567893-cover.jpg
      └── ...
```

Isso ajuda a organizar e aplicar políticas de segurança mais específicas.

## Resumo

✅ **Um único bucket** (`menu-images`) é suficiente para tudo!
- Imagens dos itens do menu → pasta `menu-items/`
- Logo do restaurante → pasta `logos/`
- Imagem de capa → pasta `covers/`

Todas as imagens ficam organizadas no mesmo bucket, facilitando o gerenciamento.


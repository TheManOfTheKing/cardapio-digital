# Guia de Deploy no Vercel

Este guia explica como fazer o deploy do projeto no Vercel.

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Projeto no GitHub, GitLab ou Bitbucket (recomendado)
3. Credenciais do Supabase configuradas

## Passo 1: Preparar o Repositório

1. Certifique-se de que o projeto está em um repositório Git
2. Faça commit de todas as alterações:
   ```bash
   git add .
   git commit -m "Preparar para deploy"
   git push
   ```

## Passo 2: Configurar Variáveis de Ambiente no Vercel

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Clique em **"Add New Project"**
3. Importe seu repositório
4. Nas configurações do projeto, vá em **Settings > Environment Variables**
5. Adicione as seguintes variáveis:

   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```

   **Importante**: 
   - Substitua pelos valores reais do seu projeto Supabase
   - Marque para **Production**, **Preview** e **Development**
   - Obtenha as credenciais em: Supabase Dashboard > Settings > API

## Passo 3: Configurar Build Settings

A Vercel detecta automaticamente projetos Vite, mas você pode verificar:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

O arquivo `vercel.json` já está configurado com essas opções.

## Passo 4: Fazer o Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Seu projeto estará disponível em uma URL como: `https://seu-projeto.vercel.app`

## Passo 5: Verificar o Deploy

Após o deploy, verifique:

1. ✅ A aplicação carrega sem erros
2. ✅ O login funciona corretamente
3. ✅ As imagens são carregadas (se configurou o storage)
4. ✅ O menu público está acessível

## Configurações Adicionais

### Domínio Personalizado

1. Vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Siga as instruções para configurar DNS

### Variáveis de Ambiente por Ambiente

Você pode ter diferentes valores para:
- **Production**: Produção
- **Preview**: Branches e PRs
- **Development**: Ambiente de desenvolvimento

### Configuração de CORS no Supabase

Se necessário, adicione o domínio da Vercel nas configurações de CORS do Supabase:
1. Supabase Dashboard > Settings > API
2. Adicione `https://seu-projeto.vercel.app` na lista de URLs permitidas

## Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se as variáveis de ambiente foram adicionadas corretamente
- Certifique-se de que estão marcadas para o ambiente correto (Production/Preview)

### Erro: "Build failed"
- Verifique os logs de build na Vercel
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se não há erros de TypeScript

### Imagens não carregam
- Verifique se o bucket do Supabase está configurado como público
- Verifique as políticas RLS do storage
- Certifique-se de que as URLs das imagens estão corretas

### Página em branco após deploy
- Verifique se o `vercel.json` está configurado corretamente
- Verifique os logs do console do navegador
- Certifique-se de que o build foi bem-sucedido

## Estrutura de Arquivos Importantes

```
cardapio-digital/
├── vercel.json          # Configuração do Vercel
├── package.json         # Dependências e scripts
├── vite.config.ts       # Configuração do Vite
├── .gitignore          # Arquivos ignorados pelo Git
└── src/
    └── lib/
        └── supabase.ts  # Cliente Supabase (usa variáveis de ambiente)
```

## Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Teste todas as funcionalidades
2. ✅ Configure domínio personalizado (opcional)
3. ✅ Configure monitoramento e analytics (opcional)
4. ✅ Configure backups do Supabase (recomendado)

## Suporte

Se encontrar problemas:
1. Verifique os logs na Vercel Dashboard
2. Verifique o console do navegador
3. Consulte a documentação da [Vercel](https://vercel.com/docs) e [Supabase](https://supabase.com/docs)


# AI Commerce Admin Panel

Painel administrativo do AI Commerce Search Engine.

## Funcionalidades
- Dashboard com métricas de cliques, conversões e receita de comissões
- CRUD de Intents (criar, editar, excluir decisões de compra)
- CRUD de Produtos (gerenciar catálogo)
- CRUD de Vendors (gerenciar parceiros afiliados)
- Login com email/senha (3-5 usuários)

## Deploy na Vercel

1. Crie repositório no GitHub: `ai-commerce-admin`
2. Suba todos os arquivos
3. Na Vercel: "Add New" → "Project" → selecione o repo
4. Configure as variáveis de ambiente:

| Variável | Valor |
|----------|-------|
| AIRTABLE_API_KEY | (token com read+write) |
| AIRTABLE_BASE_ID | appidewYBqed9GZp7 |
| JWT_SECRET | (uma string longa e aleatória) |
| ADMIN_USERS | admin@tokencompany.com:SuaSenha123,equipe1@email.com:Senha456 |

5. Clique Deploy

## Usuários Admin
Defina na variável ADMIN_USERS no formato: email:senha,email:senha
Troque as senhas padrão antes de ir para produção!

## Acesso
Após deploy, acesse: https://seu-projeto.vercel.app/login

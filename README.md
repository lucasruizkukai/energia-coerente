# Energia Coerente

Sistema de acompanhamento terapeutico online para Jaqueline Monteiro.

## Stack

- React
- Vite
- Supabase
- Vercel

## Ambientes

O app funciona em dois modos:

- `local`: usa armazenamento local do navegador enquanto o Supabase nao estiver configurado
- `supabase`: usa autenticacao e persistencia reais quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estiverem definidos

## Configuracao local

1. Copie `.env.example` para `.env`
2. Preencha as variaveis do Supabase
3. Instale as dependencias
4. Rode o projeto

## Banco de dados

O schema inicial esta em:

- `supabase/energia-coerente-schema.sql`

## Deploy

Criar um projeto novo na Vercel apontando para este repositorio e configurar as mesmas variaveis de ambiente do arquivo `.env`.

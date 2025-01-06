# InovaVoip App

Painel de controle para gerenciamento de chamadas VoIP.

## Requisitos

- Node.js 18 ou superior
- npm 8 ou superior

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/spacevoip/inovavoipapp.git
cd inovavoipapp
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Build para Produção

Para criar uma build de produção:

```bash
npm run build
```

## Deploy

O projeto está configurado para deploy automático no Netlify.
Cada push na branch main irá disparar um novo deploy automaticamente.

## Ambiente

As seguintes variáveis de ambiente são necessárias:

```env
VITE_API_URL=http://91.108.125.149:5000
```

## Tecnologias

- React
- TypeScript
- Vite
- TailwindCSS
- React Query
- Axios

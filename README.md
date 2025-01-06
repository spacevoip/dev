# InovaVoip - Painel de Controle

Sistema de gerenciamento de chamadas VoIP desenvolvido com React e TypeScript.

## Características

- Monitoramento de chamadas ativas em tempo real
- Histórico detalhado de chamadas
- Interface moderna e responsiva
- Sistema de autenticação seguro
- Proteção contra inspeção de código
- Endpoints criptografados

## Tecnologias Utilizadas

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Query
- Axios
- Lucide Icons

## Pré-requisitos

- Node.js 16+
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto e adicione:
```env
VITE_API_URL=http://91.108.125.149:5000
```

## Desenvolvimento

Para rodar em modo desenvolvimento:
```bash
npm run dev
```

## Build

Para gerar a versão de produção:
```bash
npm run build
```

Para visualizar a versão de produção localmente:
```bash
npm run preview
```

## Deploy

O projeto está configurado para deploy no Netlify. Basta conectar o repositório ao Netlify e configurar:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `16`

## Segurança

O projeto inclui várias camadas de segurança:
- Ofuscação de código
- Proteção contra inspeção
- Criptografia de endpoints
- Headers de segurança personalizados

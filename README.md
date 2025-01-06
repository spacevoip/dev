# PABX Dashboard

## Deploy no Render

### 1. Preparação

1. Crie uma conta no [Render](https://render.com)
2. Conecte seu repositório GitHub
3. Clique em "New +" e escolha "Web Service"

### 2. Configuração

1. Escolha seu repositório
2. Preencha os campos:
   - **Name**: pabx-dashboard
   - **Environment**: Static Site
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 3. Variáveis de Ambiente

No painel do Render, adicione:
```
VITE_API_URL=http://91.108.125.149:5000
VITE_SECRET_KEY=inovavoip-secure-key-2024
```

### 4. Deploy

1. Clique em "Create Web Service"
2. Aguarde o deploy (pode levar alguns minutos)
3. Seu site estará disponível em: `https://pabx-dashboard.onrender.com`

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Tecnologias

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Query
- Zustand
- Recharts

# Sistema Completo Inova

## Sobre o Projeto

Sistema de gerenciamento completo para PABX, incluindo:
- Gestão de Ramais
- Filas de Atendimento
- Monitoramento em Tempo Real
- Relatórios e Estatísticas
- Gestão de Usuários

## Tecnologias

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- React Query
- React Router DOM
- Headless UI
- Lucide Icons
- Chart.js
- Sonner (Toasts)
- XLSX (Exportação Excel)
- JSPDF (Exportação PDF)

## Deploy no Render

### 1. Preparação

1. Crie uma conta no [Render](https://render.com)
2. Conecte seu repositório GitHub
3. Clique em "New +" e escolha "Static Site"

### 2. Configuração

1. Escolha o repositório `sistemacompletoinova`
2. Configure:
   - **Name**: sistemacompletoinova
   - **Branch**: master
   - **Build Command**: `npm install && npm run build && cp dist/index.html dist/200.html && cp dist/index.html dist/404.html`
   - **Publish Directory**: `dist`

### 3. Variáveis de Ambiente

No painel do Render, adicione:
```env
VITE_API_URL=https://api.appinovavoip.com
VITE_SECRET_KEY=inovavoip-secure-key-2024
```

### 4. Deploy

1. Clique em "Create Static Site"
2. O deploy será automático a cada push na branch master
3. Site estará disponível em: `https://sistemacompletoinova.onrender.com`

## Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/spacevoip/sistemacompletoinova.git

# Entre no diretório
cd sistemacompletoinova

# Instale as dependências
npm install

# Crie o arquivo .env.local
cp .env.example .env.local

# Configure as variáveis de ambiente
# Edite o arquivo .env.local com suas configurações

# Rode em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes React reutilizáveis
  ├── contexts/       # Contextos React (Auth, etc)
  ├── hooks/          # Hooks personalizados
  ├── lib/           # Configurações de bibliotecas
  ├── pages/         # Páginas da aplicação
  ├── services/      # Serviços e APIs
  ├── styles/        # Estilos globais
  ├── types/         # Tipos TypeScript
  └── utils/         # Funções utilitárias
```

## CI/CD

O projeto está configurado com CI/CD automático:
1. Push na branch master inicia o build
2. Testes são executados
3. Se os testes passarem, deploy automático no Render
4. Notificação de status do deploy

## Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## Contato

Space VOIP - [https://spacevoip.com.br](https://spacevoip.com.br)

Link do Projeto: [https://github.com/spacevoip/sistemacompletoinova](https://github.com/spacevoip/sistemacompletoinova)

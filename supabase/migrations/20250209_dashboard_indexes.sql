-- Índices para otimizar as consultas do dashboard
create index if not exists idx_users_status on users(status);
create index if not exists idx_users_created_at on users(created_at);
create index if not exists idx_extensions_snystatus on extensions(snystatus);
create index if not exists idx_cdr_start on cdr(start);
create index if not exists idx_pagamentos_valor on pagamentos(valor);

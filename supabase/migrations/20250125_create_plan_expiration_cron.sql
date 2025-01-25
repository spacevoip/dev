-- Criar função para chamar edge function
CREATE OR REPLACE FUNCTION check_plan_expiration()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Chamar a edge function
  PERFORM
    net.http_post(
      url := current_setting('app.settings.edge_function_url') || '/check-plan-expiration',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'
    );
END;
$$;

-- Criar cron job para executar diariamente às 8:00
SELECT cron.schedule(
  'check-plan-expiration',
  '0 8 * * *',
  'SELECT check_plan_expiration();'
);

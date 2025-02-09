import { useState, useEffect } from 'react';

export function useCallDuration(initialDuration: string | number) {
  const [duration, setDuration] = useState<number>(
    typeof initialDuration === 'string' ? parseInt(initialDuration) : initialDuration
  );

  useEffect(() => {
    // Atualiza a duração a cada segundo
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return duration;
}

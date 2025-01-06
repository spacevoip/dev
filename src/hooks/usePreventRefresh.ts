import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const usePreventRefresh = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Previne F5 (código 116) e Ctrl + R (código 82 com ctrl)
      if (e.keyCode === 116 || (e.ctrlKey && e.keyCode === 82)) {
        e.preventDefault();
        // Redireciona para a mesma página para "simular" um refresh
        navigate(location.pathname + location.search, { replace: true });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [location, navigate]);
};

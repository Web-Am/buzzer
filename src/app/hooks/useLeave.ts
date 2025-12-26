import { useEffect, useRef } from 'react';

/**
 * Hook per eseguire un'azione quando l'utente lascia la pagina
 * @param onLeave - Funzione da eseguire al leave
 * @param options - Opzioni di configurazione
 */
export const usePageLeave = (
    onLeave: () => void,
    options?: {
        /** Se true, esegue onLeave anche quando il componente viene smontato */
        onUnmount?: boolean;
        /** Se true, mostra un dialog di conferma prima di lasciare la pagina */
        confirmBeforeLeave?: boolean;
    }
) => {
    const { onUnmount = true, confirmBeforeLeave = false } = options || {};
    const onLeaveRef = useRef(onLeave);

    // Mantieni il riferimento aggiornato senza causare re-render
    useEffect(() => {
        onLeaveRef.current = onLeave;
    }, [onLeave]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            onLeaveRef.current();

            if (confirmBeforeLeave) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);

            if (onUnmount) {
                onLeaveRef.current();
            }
        };
    }, [onUnmount, confirmBeforeLeave]);
};
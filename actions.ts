import { useCallback, useMemo, useState } from 'react';
import { ViewState } from './types';

export type FocusTarget =
  | { type: 'world'; id: ViewState }
  | { type: 'place'; id: string }
  | { type: 'project'; id: string }
  | { type: 'link'; url: string }
  | { type: 'guide' }
  | { type: 'guide-close' }
  | { type: 'toggle-gesture' }
  | { type: 'back' };

export interface ActionLayer {
  focus: FocusTarget | null;
  confirmFocus: FocusTarget | null;
  confirmId: number;
  summonId: number;
  dismissId: number;
  scrollSignal: { id: number; delta: number };
  setFocus: (target: FocusTarget | null) => void;
  confirm: (target?: FocusTarget | null) => void;
  summon: () => void;
  dismiss: () => void;
  scrollBy: (delta: number) => void;
}

export const useActionLayer = (): ActionLayer => {
  const [focus, setFocus] = useState<FocusTarget | null>(null);
  const [confirmFocus, setConfirmFocus] = useState<FocusTarget | null>(null);
  const [confirmId, setConfirmId] = useState(0);
  const [summonId, setSummonId] = useState(0);
  const [dismissId, setDismissId] = useState(0);
  const [scrollSignal, setScrollSignal] = useState({ id: 0, delta: 0 });

  const confirm = useCallback((target?: FocusTarget | null) => {
    const next = target === undefined ? focus : target;
    setConfirmFocus(next);
    setConfirmId((id) => id + 1);
  }, [focus]);
  const summon = useCallback(() => setSummonId((id) => id + 1), []);
  const dismiss = useCallback(() => setDismissId((id) => id + 1), []);
  const scrollBy = useCallback(
    (delta: number) => setScrollSignal((s) => ({ id: s.id + 1, delta })),
    []
  );

  return useMemo(
    () => ({
      focus,
      confirmFocus,
      confirmId,
      summonId,
      dismissId,
      scrollSignal,
      setFocus,
      confirm,
      summon,
      dismiss,
      scrollBy,
    }),
    [
      focus,
      confirmFocus,
      confirmId,
      summonId,
      dismissId,
      scrollSignal,
      confirm,
      summon,
      dismiss,
      scrollBy,
    ]
  );
};

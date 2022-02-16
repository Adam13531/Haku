import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

import { registerLocalShortcutsAtom, unregisterLocalShortcutsAtom } from 'atoms/shortcuts'
import { getShortcutMap, Keybinding, type Shortcut } from 'libs/shortcut'

export default function useLocalShortcuts<TKeybinding extends Keybinding>(shortcuts: readonly Shortcut<TKeybinding>[]) {
  const registerLocalShortcuts = useUpdateAtom(registerLocalShortcutsAtom)
  const unregisterLocalShortcuts = useUpdateAtom(unregisterLocalShortcutsAtom)

  useEffect(() => {
    registerLocalShortcuts(shortcuts)

    return () => {
      unregisterLocalShortcuts(shortcuts)
    }
  }, [registerLocalShortcuts, shortcuts, unregisterLocalShortcuts])

  return useMemo(() => getShortcutMap(shortcuts), [shortcuts])
}

import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useAtomValue } from 'jotai/utils'

import { globalShortcutsAtom, localShortcutsAtom } from 'atoms/shortcuts'
import Flex from 'components/Flex'
import { groupByKey } from 'libs/array'
import { type ParsedShortcut, sortShortcutsByLabel, getKeyAriaLabel, prettyPrintKey } from 'libs/shortcut'
import clst from 'styles/clst'

const ShortcutList: React.FC = () => {
  const globalShortcuts = groupByKey(Object.values(useAtomValue(globalShortcutsAtom)), 'group')
  const localShortcuts = groupByKey(Object.values(useAtomValue(localShortcutsAtom)), 'group')

  return (
    <Flex direction="col" className="gap-2.5">
      {[...Object.entries(globalShortcuts), ...Object.entries(localShortcuts)].map(([group, groupShortcuts]) => {
        return <ShortcutGroup key={group} group={group} shortcuts={groupShortcuts} />
      })}
    </Flex>
  )
}

export default ShortcutList

const ShortcutGroup: React.FC<ShortcutGroupProps> = ({ group, shortcuts }) => {
  return (
    <div>
      <h2 className="mb-2.5 border-b border-zinc-700 pb-0.5 text-lg font-semibold">{group}</h2>
      {sortShortcutsByLabel(shortcuts).map((shortcut) => {
        return (
          <Flex key={shortcut.keybinding} justifyContent="between" className="mb-1.5 last:mb-0">
            <div>{shortcut.label}</div>
            <ShortcutKeybinding keybinding={shortcut.parsedKeybinding} />
          </Flex>
        )
      })}
    </div>
  )
}

const ShortcutKeybinding: React.FC<ShortcutKeybindingProps> = ({ keybinding }) => {
  const keys = [...keybinding[0], keybinding[1]]

  return (
    <Flex className="gap-1">
      {keys.map((key) => {
        const prettyPrintedKey = prettyPrintKey(key)

        const kbdClasses = clst('block rounded bg-zinc-600 px-1.5 text-xs leading-[unset] shadow shadow-zinc-900', {
          'text-lg': prettyPrintedKey.length === 1 && !/[A-z?]/i.test(prettyPrintedKey),
        })

        return (
          <>
            <kbd key={key} aria-hidden className={kbdClasses}>
              {prettyPrintedKey}
            </kbd>
            <VisuallyHidden>{getKeyAriaLabel(key)}</VisuallyHidden>
          </>
        )
      })}
    </Flex>
  )
}

interface ShortcutGroupProps {
  group: ParsedShortcut['group']
  shortcuts: ParsedShortcut[]
}

interface ShortcutKeybindingProps {
  keybinding: ParsedShortcut['parsedKeybinding']
}

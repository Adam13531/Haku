import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useAtomValue } from 'jotai/utils'
import { Fragment } from 'react'

import { globalShortcutsAtom, localShortcutsAtom } from 'atoms/shortcuts'
import Flex from 'components/Flex'
import { groupByKey } from 'libs/array'
import { type DescribedShortcut, getKeyAriaLabel, prettyPrintKey, isDescribedShortcut } from 'libs/shortcut'
import clst from 'styles/clst'

const ShortcutList: React.FC = () => {
  const globalShortcuts = groupByKey(
    Object.values(useAtomValue(globalShortcutsAtom)).filter(isDescribedShortcut),
    'group'
  )
  const localShortcuts = groupByKey(
    Object.values(useAtomValue(localShortcutsAtom)).filter(isDescribedShortcut),
    'group'
  )

  return (
    <Flex direction="col" className="-m-4 gap-2.5 py-3">
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
      <div className="mb-2.5 px-4">
        <h2 className="border-b border-zinc-700 pb-0.5 text-lg font-semibold">{group}</h2>
      </div>
      {shortcuts.map((shortcut) => {
        return (
          <Flex
            justifyContent="between"
            key={shortcut.keybinding}
            className="group py-1 px-4 last:mb-0 hover:bg-zinc-700"
          >
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

        const kbdClasses = clst(
          'block rounded bg-zinc-600 px-1.5 text-xs leading-[unset] shadow shadow-zinc-900',
          'group-hover:bg-zinc-500',
          {
            'text-base': prettyPrintedKey.length === 1 && !/[A-z0-9.?]/i.test(prettyPrintedKey),
          }
        )

        return (
          <Fragment key={key}>
            <kbd aria-hidden className={kbdClasses}>
              {prettyPrintedKey}
            </kbd>
            <VisuallyHidden>{getKeyAriaLabel(key)}</VisuallyHidden>
          </Fragment>
        )
      })}
    </Flex>
  )
}

interface ShortcutGroupProps {
  group: DescribedShortcut['group']
  shortcuts: DescribedShortcut[]
}

interface ShortcutKeybindingProps {
  keybinding: DescribedShortcut['parsedKeybinding']
}

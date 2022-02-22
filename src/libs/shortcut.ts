import { isPlatformMacOS, isTextInputElement } from 'libs/html'

const modifiers = ['Alt', 'Control', 'Meta', 'Shift']

const platformNativeMetaModifier = isPlatformMacOS ? 'Meta' : 'Control'

export function getShortcutMap<TKeybinding extends Keybinding>(shortcuts: readonly Shortcut<TKeybinding>[]) {
  const shortcutMap = {} as Record<TKeybinding, Shortcut & { parsedKeybinding: ParsedKeybinding }>

  for (const shortcut of shortcuts) {
    shortcutMap[shortcut.keybinding] = { ...shortcut, parsedKeybinding: parseKeybinding(shortcut.keybinding) }
  }

  return shortcutMap
}

export function isShortcutEvent(
  event: React.KeyboardEvent<HTMLElement> | KeyboardEvent,
  shortcut: ParsedShortcut
): boolean {
  const [mods, key] = shortcut.parsedKeybinding

  return (
    // Match against `event.key` only.
    event.key.toLowerCase() === key.toLowerCase() &&
    // Ensure required modifiers are pressed.
    mods.every((mod) => event.getModifierState(mod)) &&
    // Ensure non-required modifiers are not pressed.
    modifiers.every((mod) => mods.includes(mod) || key === mod || !event.getModifierState(mod)) &&
    // Prevent the shortcut to be triggered in text inputs only if explicitely required.
    (!isTextInputElement(event.target) || (shortcut.allowInTextInput ?? true))
  )
}

export function getKeyAriaLabel(key: string): string {
  return key.replace('Alt', isPlatformMacOS ? 'Option' : 'Alt').replace('Meta', isPlatformMacOS ? 'Command' : 'Control')
}

export function prettyPrintKey(key: string): string {
  return key
    .replace('Alt', isPlatformMacOS ? '⌥' : 'Alt')
    .replace('Meta', isPlatformMacOS ? '⌘' : 'Ctrl')
    .replace('Control', isPlatformMacOS ? '⌃' : 'Ctrl')
    .replace('Shift', isPlatformMacOS ? '⇧' : 'Shift')
    .replace('Enter', '⏎')
    .replace('Backspace', '⌫')
    .replace('Tab', '⇥')
    .replace('ArrowUp', '↑')
    .replace('ArrowDown', '↓')
    .replace('ArrowLeft', '←')
    .replace('ArrowRight', '→')
}

export function isDescribedShortcut(shortcut: ParsedShortcut): shortcut is DescribedShortcut {
  return typeof shortcut.group === 'string' && typeof shortcut.label === 'string'
}

function parseKeybinding(keybinding: Keybinding): ParsedKeybinding {
  const parsedKeybinding = keybinding.trim().split('+')

  const key = parsedKeybinding.pop()
  const mods = parsedKeybinding.map((mod) => (mod === 'Meta' ? platformNativeMetaModifier : mod))

  if (!key) {
    throw new Error('Missing keybinding key.')
  }

  return [mods, key]
}

export interface Shortcut<TKeybinding = Keybinding> {
  readonly allowInTextInput?: boolean
  readonly group?: string
  readonly keybinding: TKeybinding
  readonly label?: string
  readonly onKeyDown?: (event: KeyboardEvent) => void
}

export type Keybinding = string
type ParsedKeybinding = [mods: string[], key: string]

type ParsedShortcut = Shortcut & { readonly parsedKeybinding: ParsedKeybinding }

export type DescribedShortcut = ParsedShortcut & {
  group: NonNullable<Shortcut['group']>
  label: NonNullable<Shortcut['label']>
}

export type ShortcutMap = Record<string, ParsedShortcut>

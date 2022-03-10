import { useAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { RiMenu2Line } from 'react-icons/ri'

import { sidebarCollapsedAtom } from 'atoms/sidebar'
import ContentTree from 'components/content/ContentTree'
import IconButton from 'components/form/IconButton'
import CommandPalette from 'components/palette/CommandPalette'
import NavigationPalette from 'components/palette/NavigationPalette'
import Flex from 'components/ui/Flex'
import clst from 'styles/clst'

const SidebarMenu = dynamic(import('components/ui/SidebarMenu'))

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom)

  const sidebarClasses = clst(
    'bg-zinc-900 pwa:input-hover:border-t pwa:input-hover:border-zinc-700',
    collapsed ? 'w-12 hidden md:flex' : 'w-[17rem]'
  )

  function onPressExpand() {
    setCollapsed(false)
  }

  return (
    <>
      <NavigationPalette />
      <CommandPalette />
      <Flex direction="col" className={sidebarClasses}>
        <ContentTree />
        <SidebarMenu />
      </Flex>
      {collapsed ? (
        <IconButton
          icon={RiMenu2Line}
          tooltip="Expand Menu"
          onPress={onPressExpand}
          iconClassName="w-4 h-4"
          pressedClassName="bg-zinc-500 hover:bg-zinc-500"
          className="fixed bottom-2 left-2 bg-zinc-900 p-2 shadow shadow-zinc-900 hover:bg-zinc-600 hover:text-blue-50 md:hidden"
        />
      ) : null}
    </>
  )
}

export default Sidebar

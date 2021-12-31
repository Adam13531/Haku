import { RiLogoutCircleRLine } from 'react-icons/ri'
import { signOut } from 'next-auth/react'

import ContentTree from 'components/ContentTree'
import Flex from 'components/Flex'
import IconButton from 'components/IconButton'
import NewFolderModal from 'components/NewFolderModal'
import NewContentModal from 'components/NewContentModal'

const Sidebar: React.FC = () => {
  function logout() {
    signOut({ callbackUrl: `/auth/login` })
  }

  return (
    <Flex direction="col" className="w-64 bg-zinc-900">
      <ContentTree />
      <Flex
        justifyContent="center"
        className="z-10 px-4 pb-2 border-t border-zinc-600/40 pt-1.5 shadow-[0_-1px_1px_0_rgba(0,0,0,1)]"
      >
        <NewContentModal />
        <NewFolderModal />
        <IconButton icon={RiLogoutCircleRLine} onPress={logout} tooltip="Logout" />
      </Flex>
    </Flex>
  )
}

export default Sidebar

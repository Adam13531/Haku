import { RiCloseLine } from 'react-icons/ri'
import { LinkItUrl } from 'react-linkify-it'

import Flex from 'components/ui/Flex'
import List from 'components/ui/List'
import { LIST_SHIMMER_CLASSES } from 'constants/shimmer'
import useInboxEntriesQuery from 'hooks/useInboxEntriesQuery'
import { useInboxEntryMutation } from 'hooks/useInboxEntryMutation'
import { isNonEmptyArray } from 'libs/array'
import { InboxEntryData } from 'libs/db/inbox'
import clst from 'styles/clst'
import styles from 'styles/InboxList.module.css'

const listClasses = clst(
  'grow overflow-y-auto border-t border-b border-zinc-900 p-3',
  'supports-max:pl-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-left)))]',
  'supports-max:pb-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-bottom)))]'
)

const InboxList: React.FC = () => {
  const { data, isLoading } = useInboxEntriesQuery()

  if (!isLoading && !isNonEmptyArray(data)) {
    return (
      <Flex
        fullWidth
        fullHeight
        direction="col"
        alignItems="center"
        className="mt-6 p-3 supports-max:pl-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-left)))]"
      >
        <span>Start by creating a new inbox entry.</span>
      </Flex>
    )
  }

  return (
    <List isLoading={isLoading} shimmerClassNames={LIST_SHIMMER_CLASSES} className={listClasses}>
      {data?.map((entry) => (
        <InboxListEntry key={entry.id} entry={entry} />
      ))}
    </List>
  )
}

export default InboxList

const InboxListEntry: React.FC<InboxListEntryProps> = ({ entry }) => {
  const { mutate } = useInboxEntryMutation()

  function onClickRemove() {
    mutate({ action: 'delete', id: entry.id })
  }

  const textClasses = clst(styles.entry, 'min-w-0 break-words')

  return (
    <List.Item className="items-start py-2 pr-2">
      <LinkItUrl>
        <div className={textClasses}>{entry.text}</div>
      </LinkItUrl>
      <div className="flex">
        <List.Button icon={RiCloseLine} tooltip="Delete" onPress={onClickRemove} />
      </div>
    </List.Item>
  )
}

interface InboxListEntryProps {
  entry: InboxEntryData
}

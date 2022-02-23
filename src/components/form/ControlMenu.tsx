import { Presence } from '@radix-ui/react-presence'
import { type UseSelectPropGetters, type UseSelectState } from 'downshift'
import { RefObject, useEffect, useState } from 'react'

import clst from 'styles/clst'

const menuWindowBottomOffsetInPixels = 20
const menuMaxHeightInPixels = 210

const ControlMenu = <TItem,>({
  className,
  container,
  disableAnimation,
  getItemProps,
  highlightedIndex,
  isOpen,
  items,
  itemToInnerHtml,
  itemToString,
  menuClassName,
  menuProps,
}: ControlMenuProps<TItem>) => {
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    function calculateMaxHeight() {
      const rect = container.current?.getBoundingClientRect()

      setMaxHeight(
        rect
          ? Math.min(window.innerHeight - rect.bottom - menuWindowBottomOffsetInPixels, menuMaxHeightInPixels)
          : undefined
      )
    }

    calculateMaxHeight()

    window.addEventListener('resize', calculateMaxHeight)
    window.addEventListener('scroll', calculateMaxHeight, true)

    return () => {
      window.removeEventListener('resize', calculateMaxHeight)
      window.removeEventListener('scroll', calculateMaxHeight, true)
    }
  }, [container])

  const containerClasses = clst('absolute top-full inset-x-0 mt-0.5 outline-none', className)
  const menuClasses = clst(
    'rounded-md bg-zinc-700 shadow-sm shadow-zinc-900/50 overflow-auto origin-top',
    {
      'animate-control-menu': !disableAnimation,
    },
    menuClassName
  )

  return (
    <div {...menuProps} className={containerClasses}>
      <Presence present={isOpen}>
        <ul
          className={menuClasses}
          data-state={isOpen ? 'open' : 'closed'}
          style={{ maxHeight: maxHeight ? `${maxHeight}px` : 'initial' }}
        >
          {items.map((item, index) => {
            const isHighlighted = highlightedIndex === index

            const menuItemClasses = clst('px-3 py-1.5 cursor-pointer text-ellipsis overflow-hidden', {
              'bg-blue-600': isHighlighted,
            })

            return (
              <li
                key={`${itemToString(item)}-${index}`}
                {...getItemProps({
                  className: menuItemClasses,
                  dangerouslySetInnerHTML: itemToInnerHtml
                    ? { __html: itemToInnerHtml(item, isHighlighted) }
                    : undefined,
                  item,
                  index,
                })}
              >
                {itemToInnerHtml ? null : itemToString(item)}
              </li>
            )
          })}
        </ul>
      </Presence>
    </div>
  )
}

export default ControlMenu

export interface ControlMenuProps<TItem> {
  className?: string
  container: RefObject<HTMLDivElement>
  disableAnimation?: boolean
  getItemProps: UseSelectPropGetters<TItem>['getItemProps']
  highlightedIndex: UseSelectState<TItem>['highlightedIndex']
  isOpen: UseSelectState<TItem>['isOpen']
  itemToInnerHtml?: (item: TItem, isHighlighted: boolean) => string
  itemToString: (item: TItem | null) => string
  items: TItem[]
  menuClassName?: string
  menuProps: ReturnType<UseSelectPropGetters<TItem>['getMenuProps']>
}
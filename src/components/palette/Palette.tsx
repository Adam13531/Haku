import { Content, Overlay, Portal, Root, Title } from '@radix-ui/react-dialog'
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'

import PalettePicker from 'components/palette/PalettePicker'
import { type IconProps } from 'components/ui/Icon'
import { MODAL_CONTENT_CLASSES, MODAL_OVERLAY_CLASSES } from 'components/ui/Modal'
import clst from 'styles/clst'

const Palette = <TItem extends PaletteItem>({ forwardedRef, role, title, ...props }: PaletteProps<TItem>) => {
  const overlayClasses = clst(MODAL_OVERLAY_CLASSES, 'pt-0 md:pt-0')

  const contentClasses = clst(
    MODAL_CONTENT_CLASSES,
    'flex flex-col my-0 xs:my-0 max-h-[500px] xs:w-[400px] animate-palette-content overflow-y-hidden rounded-t-none'
  )

  return (
    <Root open={props.opened} onOpenChange={props.onOpenChange}>
      <Portal>
        <Overlay className={overlayClasses}>
          <Content className={contentClasses} role={role}>
            <VisuallyHidden>
              <Title>{title}</Title>
            </VisuallyHidden>
            <PalettePicker {...props} ref={forwardedRef} />
          </Content>
        </Overlay>
      </Portal>
    </Root>
  )
}

export default Palette

export interface PaletteProps<TItem extends PaletteItem> {
  enterKeyHint?: React.InputHTMLAttributes<HTMLInputElement>['enterKeyHint']
  forwardedRef?: React.ForwardedRef<HTMLInputElement>
  fuzzy?: boolean
  infinite?: boolean
  initialQuery?: string
  isLoading?: boolean
  isLoadingMore?: boolean
  itemDetailsToString?: (item: TItem | null) => string
  items: TItem[]
  itemToIcon?: (item: TItem | null) => IconProps['icon'] | null
  itemToString: (item: TItem | null) => string
  loadMore?: () => void
  minQueryLength?: number
  onOpenChange: (opened: boolean) => void
  onPick: (item: TItem | null | undefined) => void
  onQueryChange?: (query?: string) => void
  opened?: boolean
  placeholder: string
  role?: React.HtmlHTMLAttributes<HTMLElement>['role']
  title: string
}

export interface PaletteItem {
  disabled?: boolean
}

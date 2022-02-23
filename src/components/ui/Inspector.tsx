import { Content, Item, Root, Trigger } from '@radix-ui/react-dropdown-menu'
import { Children, cloneElement, forwardRef, isValidElement } from 'react'

import Button, { type ButtonProps } from 'components/form/Button'
import IconButton, { type IconButtonProps } from 'components/form/IconButton'
import Flex from 'components/ui/Flex'
import { type IconProps } from 'components/ui/Icon'
import clst from 'styles/clst'

const Inspector: InspectorComponent = ({ children, disabled }) => {
  return (
    <Flex direction="col" className="w-[15.2rem] shrink-0 overflow-y-auto border-l border-zinc-600/50 bg-zinc-900">
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return null
        }

        return cloneElement(child, { ...child.props, disabled })
      })}
    </Flex>
  )
}

export default Inspector

const InspectorSection: React.FC<InspectorSectionProps> = ({
  children,
  className,
  disabled,
  sectionClassName,
  title,
  titleClassName,
}) => {
  const sectionClasses = clst(
    'shrink-0 pt-2 pb-3 px-3 border-b border-zinc-600/25 last-of-type:border-0 overflow-hidden',
    {
      'pt-3': typeof title === 'undefined',
    },
    sectionClassName
  )
  const titleClasses = clst('mb-2 text-blue-100/75 text-xs font-medium', titleClassName)
  const contentClasses = clst('gap-2.5', className)

  return (
    <Flex direction="col" className={sectionClasses}>
      {title ? <div className={titleClasses}>{title}</div> : null}
      <Flex wrap alignItems="baseline" className={contentClasses}>
        {Children.map(children, (child) => {
          if (!isValidElement(child)) {
            return null
          }

          return cloneElement(child, { ...child.props, disabled: child.props.disabled || disabled })
        })}
      </Flex>
    </Flex>
  )
}

Inspector.Section = InspectorSection

const InspectorButton: React.FC<ButtonProps> = (props) => {
  const buttonClasses = clst('min-w-[65px] mx-0 py-1 bg-zinc-700 hover:bg-zinc-600 shadow-none', {
    'bg-blue-600 hover:bg-blue-500': props.primary,
  })
  const pressedButtonClasses = clst('bg-zinc-500 hover:bg-zinc-500', {
    'bg-blue-400 hover:bg-blue-400': props.primary,
  })

  return <Button {...props} className={buttonClasses} pressedClassName={pressedButtonClasses} />
}

Inspector.Button = InspectorButton

const InspectorToggle: React.FC<InspectorToggleProps> = ({ onToggle, toggled, ...props }) => {
  const buttonClasses = clst({
    'bg-blue-500 hover:bg-blue-400 border-blue-400': toggled,
  })
  const pressedButtonClasses = clst({
    'bg-zinc-400 hover:bg-zinc-500': !toggled,
    'bg-blue-300 hover:bg-blue-300': toggled,
  })

  function onPress() {
    onToggle(!toggled)
  }

  return (
    <InspectorIconButton
      {...props}
      onPress={onPress}
      className={buttonClasses}
      pressedClassName={pressedButtonClasses}
    />
  )
}

Inspector.Toggle = InspectorToggle

const InspectorIconButton = forwardRef<HTMLButtonElement, React.PropsWithChildren<InspectorIconButtonProps>>(
  ({ className, pressedClassName, tooltip, ...props }, forwardedRef) => {
    const buttonClasses = clst(
      'mx-0 bg-zinc-700 hover:bg-zinc-600 hover:text-blue-50 shadow-none disabled:bg-zinc-700',
      className
    )
    const pressedButtonClasses = clst('bg-zinc-500 hover:bg-zinc-500', pressedClassName)

    return (
      <IconButton
        {...props}
        tooltip={tooltip}
        ref={forwardedRef}
        className={buttonClasses}
        pressedClassName={pressedButtonClasses}
      />
    )
  }
)

InspectorIconButton.displayName = 'InspectorIconButton'
Inspector.IconButton = InspectorIconButton

const InspectorIconMenu: React.FC<InspectorIconButtonMenuProps> = ({ children, disabled, icon, toggled, tooltip }) => {
  const buttonClasses = clst({
    'bg-blue-500 hover:bg-blue-400 border-blue-400': toggled,
  })
  const pressedButtonClasses = clst({
    'bg-blue-300 hover:bg-blue-300': toggled,
  })

  function onCloseAutoFocus(event: Event) {
    event.preventDefault()
  }

  return (
    <Root>
      <Trigger asChild>
        <InspectorIconButton
          icon={icon}
          tooltip={tooltip}
          disabled={disabled}
          className={buttonClasses}
          pressedClassName={pressedButtonClasses}
        />
      </Trigger>
      <Content loop onCloseAutoFocus={onCloseAutoFocus}>
        <Flex direction="col" className="mt-[2px] rounded-md bg-zinc-700 shadow-sm shadow-black/50">
          {children}
        </Flex>
      </Content>
    </Root>
  )
}

Inspector.IconMenu = InspectorIconMenu

const InspectorIconMenuItem: React.FC<InspectorIconMenuItemProps> = ({ icon, onClick }) => {
  return (
    <Item asChild>
      <InspectorIconButton
        icon={icon}
        onClick={onClick}
        className="focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-offset-red-500"
      />
    </Item>
  )
}

Inspector.IconMenuItem = InspectorIconMenuItem

type InspectorComponent = React.FC<InspectorProps> & {
  Button: typeof InspectorButton
  IconButton: typeof InspectorIconButton
  IconMenu: typeof InspectorIconMenu
  IconMenuItem: typeof InspectorIconMenuItem
  Section: typeof InspectorSection
  Toggle: typeof InspectorToggle
}

interface InspectorProps {
  disabled?: boolean
}

interface InspectorSectionProps {
  className?: string
  disabled?: boolean
  sectionClassName?: string
  title?: string
  titleClassName?: string
}

interface InspectorIconButtonProps {
  className?: string
  disabled?: IconButtonProps['disabled']
  icon: IconProps['icon']
  onClick?: IconButtonProps['onClick']
  onPress?: IconButtonProps['onPress']
  pressedClassName?: string
  tooltip?: string
}

interface InspectorToggleProps extends Omit<InspectorIconButtonProps, 'onPress'> {
  toggled?: boolean
  onToggle: (toggled: boolean) => void
}

interface InspectorIconButtonMenuProps {
  disabled?: boolean
  icon: IconProps['icon']
  toggled?: boolean
  tooltip: string
}

interface InspectorIconMenuItemProps extends Omit<InspectorIconButtonMenuProps, 'tooltip'> {
  onClick: IconButtonProps['onClick']
}
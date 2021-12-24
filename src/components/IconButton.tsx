import clsx from 'clsx'
import { forwardRef, type PropsWithChildren } from 'react'

import Button, { type ButtonProps } from 'components/Button'
import Tooltip from 'components/Tooltip'

const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<Props>>(
  ({ children, className, tooltip, ...props }, forwardedRef) => {
    const classes = clsx(
      '!bg-inherit hover:!bg-zinc-700/75 hover:text-blue-600 disabled:!bg-inherit disabled:text-inherit shadow-none',
      'px-2 mx-0.5 min-w-0',
      className
    )

    const content = (
      <Button {...props} ref={forwardedRef} className={classes} pressedClassName="bg-blue-50/20 hover:bg-blue-50/20">
        {children}
      </Button>
    )

    return tooltip ? <Tooltip content={tooltip}>{content}</Tooltip> : content
  }
)

IconButton.displayName = 'IconButton'

export default IconButton

interface Props extends Omit<ButtonProps, 'primary'> {
  className?: string
  tabIndex?: ButtonProps['tabIndex']
  tooltip?: string
}

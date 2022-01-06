import useDelay from 'hooks/useDelay'
import clst from 'styles/clst'

const Spinner: React.FC<SpinnerProps> = ({ className, color, delay }) => {
  const pastDelay = useDelay(delay)

  // Avoid a flash of the spinner if a component / route loads really quickly (<250ms).
  if (delay && !pastDelay) {
    return null
  }

  const spinnerClasses = clst('animate-spin-slow', color ?? 'text-blue-50/40', className)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className={spinnerClasses}>
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
        className="stroke-current motion-safe:animate-dash [stroke-linecap:round]"
      ></circle>
    </svg>
  )
}

export default Spinner

interface SpinnerProps {
  className?: string
  color?: string
  delay?: boolean
}

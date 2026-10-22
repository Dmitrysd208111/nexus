import { initials } from '../utilities/format'
export function Avatar({
  name,
  size = 'normal',
}: {
  name: string
  size?: 'small' | 'normal' | 'large'
}) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (
    <span className={`avatar avatar-${size} avatar-color-${hash % 6}`} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

export function Badge({ value }: { value: string }) {
  return (
    <span className={`badge badge-${value.toLowerCase().replaceAll(' ', '-')}`}>
      <span className="badge-dot" />
      {value}
    </span>
  )
}

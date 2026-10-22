import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
export default function NotFoundPage() {
  return (
    <div className="empty-state not-found">
      <Compass size={42} />
      <span className="eyebrow">ERROR 404</span>
      <h1>A little off the map.</h1>
      <p>This page doesn’t exist. Your workspace is right this way.</p>
      <Link className="button primary" to="/overview">
        <ArrowLeft size={16} />
        Back to overview
      </Link>
    </div>
  )
}

import { format, parseISO } from 'date-fns'
import { ArrowUpRight, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Modal } from '../../shared/Modal'
import { Badge } from '../../shared/Badge'
import { Avatar } from '../../shared/Avatar'
import type { Customer, Dataset, EntityMap, EntityType, Order, Product } from '../../types'
import { earnsRevenue, orderTotal } from '../../utilities/analytics'
import { money } from '../../utilities/format'
export function RecordDetails({
  type,
  record,
  data,
  onClose,
  onEdit,
}: {
  type: EntityType
  record: EntityMap[EntityType]
  data: Dataset
  onClose: () => void
  onEdit: () => void
}) {
  const order = type === 'orders' ? (record as Order) : undefined
  const customer =
    type === 'customers'
      ? (record as Customer)
      : order
        ? data.customers.find((c) => c.id === order.customerId)
        : undefined
  const product = type === 'products' ? (record as Product) : undefined
  const related = data.orders.filter((o) =>
    type === 'customers'
      ? o.customerId === record.id
      : type === 'products'
        ? o.items.some((i) => i.productId === record.id)
        : false,
  )
  return (
    <Modal
      title={
        order
          ? `Order ${order.id}`
          : customer && !order
            ? customer.name
            : (product?.name ?? record.id)
      }
      description={`Record ID · ${record.id}`}
      onClose={onClose}
      wide={!!order}
      drawer
    >
      <div className="record-details">
        {order && (
          <>
            <div className="details-summary">
              <Badge value={order.status} />
              <span>{format(parseISO(order.date), 'MMMM d, yyyy')}</span>
            </div>
            {customer && (
              <div className="customer-cell details-customer">
                <Avatar name={customer.name} />
                <div>
                  <strong>{customer.name}</strong>
                  <span>{customer.email}</span>
                </div>
              </div>
            )}
            <div className="detail-items">
              {order.items.map((item) => (
                <div key={item.productId}>
                  <div>
                    <strong>
                      {data.products.find((p) => p.id === item.productId)?.name ??
                        'Unknown product'}
                    </strong>
                    <span>
                      {item.quantity} × {money(item.unitPrice)}
                    </span>
                  </div>
                  <strong>{money(item.quantity * item.unitPrice)}</strong>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>Total</span>
              <strong>{money(orderTotal(order))}</strong>
            </div>
            {order.notes && (
              <div className="detail-note">
                <h3>Internal notes</h3>
                <p>{order.notes}</p>
              </div>
            )}
          </>
        )}
        {type === 'customers' && customer && (
          <>
            <div className="profile-detail">
              <Avatar name={customer.name} size="large" />
              <div>
                <strong>{customer.company}</strong>
                <span>{customer.email}</span>
              </div>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Country</dt>
                <dd>{customer.country}</dd>
              </div>
              <div>
                <dt>Acquisition</dt>
                <dd>{customer.source}</dd>
              </div>
              <div>
                <dt>Joined</dt>
                <dd>{format(parseISO(customer.createdAt), 'MMM d, yyyy')}</dd>
              </div>
              <div>
                <dt>Lifetime revenue</dt>
                <dd>
                  {money(related.filter(earnsRevenue).reduce((sum, o) => sum + orderTotal(o), 0))}
                </dd>
              </div>
            </dl>
            <Link
              to={`/orders?customer=${customer.id}`}
              className="button secondary"
              onClick={onClose}
            >
              View {related.length} orders
              <ArrowUpRight size={16} />
            </Link>
          </>
        )}
        {product && (
          <>
            <dl className="detail-grid">
              <div>
                <dt>SKU</dt>
                <dd>{product.sku}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{product.category}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{money(product.price)}</dd>
              </div>
              <div>
                <dt>Stock</dt>
                <dd>{product.stock} units</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <Badge value={product.status} />
                </dd>
              </div>
              <div>
                <dt>Orders containing product</dt>
                <dd>{related.length}</dd>
              </div>
            </dl>
            <Link
              to={`/orders?product=${product.id}`}
              className="button secondary"
              onClick={onClose}
            >
              View related orders
              <ArrowUpRight size={16} />
            </Link>
          </>
        )}
      </div>
      <div className="modal-footer">
        <button className="button secondary" onClick={onClose}>
          Close
        </button>
        <button className="button primary" onClick={onEdit}>
          <Pencil size={15} />
          Edit record
        </button>
      </div>
    </Modal>
  )
}

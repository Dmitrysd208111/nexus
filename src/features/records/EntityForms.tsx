import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { LoaderCircle, Plus, Trash2 } from 'lucide-react'
import type { z } from 'zod'
import { customerSchema, orderSchema, productSchema } from '../../schemas'
import type { Customer, Dataset, EntityMap, EntityType, Order, Product } from '../../types'
import { categories, orderStatuses, sources } from '../../types'
import { api } from '../../services/api'
import { workspaceKey } from '../../hooks/useWorkspace'
import { Modal } from '../../shared/Modal'
import { useToast } from '../../shared/Toast'
import { money } from '../../utilities/format'

function useSave<T extends EntityType>(type: T, id: string | undefined, onClose: () => void) {
  const client = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (values: Omit<EntityMap[T], 'id'>) => api.save(type, values, id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: workspaceKey })
      toast(
        `${{ orders: 'Order', customers: 'Customer', products: 'Product' }[type]} ${id ? 'updated' : 'created'} successfully`,
      )
      onClose()
    },
  })
}
function Footer({
  saving,
  onClose,
  editing,
}: {
  saving: boolean
  onClose: () => void
  editing: boolean
}) {
  return (
    <div className="modal-footer">
      <button type="button" className="button secondary" onClick={onClose} disabled={saving}>
        Cancel
      </button>
      <button className="button primary" disabled={saving}>
        {saving && <LoaderCircle size={16} className="spin" />}
        {saving ? 'Saving…' : editing ? 'Save changes' : 'Create record'}
      </button>
    </div>
  )
}
function FieldError({ message }: { message?: string }) {
  return message ? (
    <span className="field-error" role="alert">
      {message}
    </span>
  ) : null
}
function CustomerForm({ customer, onClose }: { customer?: Customer; onClose: () => void }) {
  const save = useSave('customers', customer?.id, onClose)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ?? {
      name: '',
      email: '',
      company: '',
      country: 'United States',
      source: 'Direct',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    },
  })
  return (
    <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))}>
      <div className="form-grid">
        <label className="field full">
          Full name
          <input
            autoComplete="name"
            {...register('name')}
            aria-invalid={!!errors.name}
            placeholder="e.g. Olivia Rhye"
          />
          <FieldError message={errors.name?.message} />
        </label>
        <label className="field full">
          Email address
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
            placeholder="olivia@company.com"
          />
          <FieldError message={errors.email?.message} />
        </label>
        <label className="field">
          Company
          <input {...register('company')} placeholder="Company name" />
          <FieldError message={errors.company?.message} />
        </label>
        <label className="field">
          Country
          <input {...register('country')} />
          <FieldError message={errors.country?.message} />
        </label>
        <label className="field">
          Acquisition source
          <select {...register('source')}>
            {sources.map((source) => (
              <option key={source}>{source}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Joined on
          <input type="date" {...register('createdAt')} />
          <FieldError message={errors.createdAt?.message} />
        </label>
      </div>
      {save.isError && (
        <p className="form-error" role="alert">
          {save.error.message}
        </p>
      )}
      <Footer saving={save.isPending} onClose={onClose} editing={!!customer} />
    </form>
  )
}
function ProductForm({ product, onClose }: { product?: Product; onClose: () => void }) {
  const save = useSave('products', product?.id, onClose)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      name: '',
      sku: '',
      category: 'Software',
      price: 0,
      stock: 0,
      status: 'Active',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    },
  })
  return (
    <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))}>
      <div className="form-grid">
        <label className="field full">
          Product name
          <input {...register('name')} placeholder="e.g. Studio Pro License" />
          <FieldError message={errors.name?.message} />
        </label>
        <label className="field">
          SKU
          <input {...register('sku')} placeholder="NX-SOF-100" />
          <FieldError message={errors.sku?.message} />
        </label>
        <label className="field">
          Category
          <select {...register('category')}>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Price (USD)
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <input
                ref={field.ref}
                onBlur={field.onBlur}
                name={field.name}
                type="number"
                step="0.01"
                min="0.01"
                value={Number.isNaN(field.value) ? '' : field.value / 100}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? NaN : Math.round(Number(e.target.value) * 100),
                  )
                }
              />
            )}
          />
          <FieldError message={errors.price?.message} />
        </label>
        <label className="field">
          Available stock
          <input type="number" {...register('stock', { valueAsNumber: true })} />
          <FieldError message={errors.stock?.message} />
        </label>
        <label className="field full">
          Status
          <select {...register('status')}>
            <option>Active</option>
            <option>Draft</option>
          </select>
        </label>
      </div>
      <p className="form-hint">
        Price changes apply to future orders. Existing orders retain their original prices.
      </p>
      {save.isError && (
        <p className="form-error" role="alert">
          {save.error.message}
        </p>
      )}
      <Footer saving={save.isPending} onClose={onClose} editing={!!product} />
    </form>
  )
}
function OrderForm({
  order,
  data,
  onClose,
}: {
  order?: Order
  data: Dataset
  onClose: () => void
}) {
  const save = useSave('orders', order?.id, onClose)
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: order ?? {
      customerId: '',
      status: 'Pending',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')
  const total = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
  return (
    <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))}>
      <div className="form-grid">
        <label className="field full">
          Customer
          <select {...register('customerId')}>
            <option value="">Select a customer</option>
            {data.customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} · {customer.company}
              </option>
            ))}
          </select>
          <FieldError message={errors.customerId?.message} />
        </label>
        <label className="field">
          Order date
          <input type="date" {...register('date')} />
          <FieldError message={errors.date?.message} />
        </label>
        <label className="field">
          Status
          <select {...register('status')}>
            {orderStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="line-items-heading">
        <h3>Order items</h3>
        <span className="muted small">Prices in USD</span>
      </div>
      <div className="line-items">
        {fields.map((field, index) => (
          <div className="line-item" key={field.id}>
            <label className="field item-product">
              Product
              <select
                {...register(`items.${index}.productId`, {
                  onChange: (e: { target: { value: string } }) => {
                    const product = data.products.find((p) => p.id === e.target.value)
                    if (product)
                      setValue(`items.${index}.unitPrice`, product.price, { shouldValidate: true })
                  },
                })}
              >
                <option value="">Select product</option>
                {data.products
                  .filter((p) => p.status === 'Active' || p.id === items[index]?.productId)
                  .map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
              </select>
              <FieldError message={errors.items?.[index]?.productId?.message} />
            </label>
            <label className="field item-qty">
              Qty
              <input
                type="number"
                min="1"
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
              />
              <FieldError message={errors.items?.[index]?.quantity?.message} />
            </label>
            <label className="field item-price">
              Unit price
              <Controller
                control={control}
                name={`items.${index}.unitPrice`}
                render={({ field: input }) => (
                  <input
                    ref={input.ref}
                    onBlur={input.onBlur}
                    name={input.name}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={Number.isNaN(input.value) ? '' : input.value / 100}
                    onChange={(e) =>
                      input.onChange(
                        e.target.value === '' ? NaN : Math.round(Number(e.target.value) * 100),
                      )
                    }
                  />
                )}
              />
              <FieldError message={errors.items?.[index]?.unitPrice?.message} />
            </label>
            <button
              type="button"
              className="icon-button remove-item"
              aria-label={`Remove item ${index + 1}`}
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <FieldError message={errors.items?.root?.message ?? errors.items?.message} />
      <button
        type="button"
        className="button text-button"
        onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
      >
        <Plus size={15} />
        Add another product
      </button>
      <div className="order-total">
        <span>Order total</span>
        <strong>{money(total)}</strong>
      </div>
      <label className="field">
        Internal notes
        <textarea {...register('notes')} placeholder="Add a note for your team…" rows={2} />
        <FieldError message={errors.notes?.message} />
      </label>
      {save.isError && (
        <p className="form-error" role="alert">
          {save.error.message}
        </p>
      )}
      <Footer saving={save.isPending} onClose={onClose} editing={!!order} />
    </form>
  )
}
export function EntityEditor({
  type,
  record,
  data,
  onClose,
}: {
  type: EntityType
  record?: EntityMap[EntityType]
  data: Dataset
  onClose: () => void
}) {
  const label = { orders: 'order', customers: 'customer', products: 'product' }[type]
  return (
    <Modal
      wide={type === 'orders'}
      title={`${record ? 'Edit' : 'Create'} ${label}`}
      description={`Your changes are saved locally in this browser.`}
      onClose={onClose}
    >
      {type === 'orders' ? (
        <OrderForm order={record as Order | undefined} data={data} onClose={onClose} />
      ) : type === 'customers' ? (
        <CustomerForm customer={record as Customer | undefined} onClose={onClose} />
      ) : (
        <ProductForm product={record as Product | undefined} onClose={onClose} />
      )}
    </Modal>
  )
}

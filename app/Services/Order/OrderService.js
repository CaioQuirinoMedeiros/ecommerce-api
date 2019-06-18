'use strict'

const Database = use('Database')

class OrderService {
  constructor(model, trx = null) {
    this.model = model
    this.trx = trx
  }

  async syncItems(items) {
    if (!Array.isArray(items)) return false

    await this.model.items().delete(this.trx)

    await this.model.items().createMany(items, this.trx)
  }

  async canApplyDiscount(cupon) {
    const now = new Date().getTime()

    if (now < cupon.valid_from.getTime()) return false
    if (cupon.valid_until.getTime() && now > cupon.valid_until.getTime())
      return false

    const cuponProductsIds = await Database.from('cupon_product')
      .where('cupon_id', cupon.id)
      .pluck('product_id')

    const cuponClientsIds = await Database.from('cupon_user')
      .where('cupon_id', cupon.id)
      .pluck('user_id')

    const isAssociatedToProducts = !!cuponProductsIds.length
    const isAssociatedToClients = !!cuponClientsIds.length

    if (!isAssociatedToProducts && !isAssociatedToClients) {
      return true
    }

    const matchedProductsIds = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', cuponProductsIds)
      .pluck('product_id')

    const clientMatch = cuponClientsIds.find(
      clientId => clientId === this.model.user_id
    )

    if (isAssociatedToProducts && isAssociatedToClients) {
      return clientMatch && matchedProductsIds.length ? true : false
    }

    if (isAssociatedToProducts) {
      return matchedProductsIds.length ? true : false
    }

    if (isAssociatedToClients) {
      return clientMatch ? true : false
    }
  }
}

module.exports = OrderService

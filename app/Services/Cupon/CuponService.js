'use strict'

class CuponService {
  constructor(model, trx = null) {
    this.model = model
    this.trx = trx
  }

  async syncUsers(users) {
    if (Array.isArray(users)) return false

    await this.model.users().sync(users, null, trx)
  }

  async syncOrders(orders) {
    if (Array.isArray(orders)) return false

    await this.model.orders().sync(orders, null, trx)
  }

  async syncProducts(products) {
    if (Array.isArray(products)) return false

    await this.model.products().sync(products, null, trx)
  }
}

module.exports = CuponService

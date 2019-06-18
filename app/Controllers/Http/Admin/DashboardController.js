'use strict'

const Database = use('Database')

class DashboardController {
  async index({ response }) {
    try {
      const users = await Database.from('users').getCount()
      const orders = await Database.from('orders').getCount()
      const products = await Database.from('products').getCount()

      const subtotal = await Database.from('order_items').getSum('subtotal')
      const discounts = await Database.from('cupon_order').getSum('discount')

      const revenue = subtotal - discounts

      response.status(200).send({ users, orders, products, revenue })
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível caregar o dashboard' })
    }
  }
}

module.exports = DashboardController

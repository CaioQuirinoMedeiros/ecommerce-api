'use strict'

const Database = use('Database')

class DashboardController {
  async index({ response }) {
    const users = await Dabatase.from('users').getCount()
    const orders = await Dabatase.from('orders').getCount()
    const products = await Dabatase.from('products').getCount()

    const subtotal = await Database.from('order_items').getSum('subtotal')
    const discounts = await Database.from('cupon_order').getSum('discount')

    const revenue = subtotal - discounts

    response.status(200).send({ users, orders, products, revenue })
  }
}

module.exports = DashboardController

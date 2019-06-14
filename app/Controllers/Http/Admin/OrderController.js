'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Order = use('App/Models/Order')
const Databse = use('Database')
const OrderService = use('App/Services/Order/OrderService')

const Cupon = use('App/Models/Cupon')
const Discount = use('App/Models/Discount')

class OrderController {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const { page, limit } = pagination
    const status = request.input('status')

    const query = Order.query()

    if (status) {
      query.where('status', status)
    }

    const orders = await Order.query()
      .orderBy('id', 'DESC')
      .paginate(page, limit)

    return response.status(200).send(orders)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const trx = await Database.beginTransaction()

    try {
      const { user_id, items, status } = request.all()

      const order = await Order.create({
        user_id,
        items,
        status,
        trx
      })

      const service = new Service(order, trx)

      if (items && items.length) {
        await service.syncItems(items)
      }

      await trx.commit()

      return response.status(201).send(order)
    } catch (err) {
      await trx.rollback()

      return response
        .status(400)
        .send({ message: 'Não foi possível criar o pedido' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Params} ctx.params
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async show({ params, response }) {
    const order = await Order.findOrFail(params.id)

    await order.load('user')

    return response.send(order)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async update({ params, request, response }) {
    const order = await Order.findOrFail(params.id)

    const trx = await Database.beginTransaction()

    try {
      const { user_id, items, status } = request.all()

      order.merge({ user_id, status })

      const service = new OrderService(order, trx)

      await service.updateItems(items)

      await order.save(trx)

      await trx.commit()

      return response.status(200).send(order)
    } catch (err) {
      await trx.rollback()

      return response
        .status(400)
        .send({ message: 'Não foi possível atualizar o pedido' })
    }
  }

  /**
   * @param {object} ctx
   * @param {object} ctx.params
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const order = await Order.findOrFail(params.id)

    const trx = await Database.beginTransaction()

    try {
      await order.items().delete(trx)
      await order.cupons().delete(trx)
      await order.delete(trx)

      await trx.commit()

      return response.status(204).send()
    } catch (err) {
      await trx.rollback()

      return response
        .status(500)
        .send({ message: 'Não foi possível deletar o pedido' })
    }
  }

  async applyDiscount({ params, request, response }) {
    const code = request.input('code')

    const cupon = await Cupon.findByOrFail('code', code.toUpperCase())

    const order = await Order.findOrFail(params.id)

    let discount,
      info = {}

    try {
      const service = new OrderService(order)

      const canAddDiscount = service.canApplyDiscount(cupon)

      const orderDiscounts = await order.cupons().getCount()

      const canApplyToOrder =
        orderDiscounts < 1 || (orderDiscounts >= 1 && cupon.recursive)

      if (canAddDiscount && canApplyToOrder) {
        discount = await Discount.findOrCreate({
          order_id: order.id,
          cupon_id: cupon.id
        })

        info.message = 'Cupon aplicado com sucesso'
        info.success = true
      }

      return response.status(200).send({ order, info })
    } catch (err) {
      info.message = 'Não foi possível aplicar esse cupon'
      info.success = false

      return response.status(400).send(info)
    }
  }

  async removeDiscount({ request, response }) {
    const { discount_id } = request.all()

    try {
      const discount = await Discount.findOrFail(discount_id)

      await discount.delete()

      return response.status(204).send()
    } catch (err) {
      return response
        .status(500)
        .send({ message: 'Não foi possível remover o desconto' })
    }
  }
}

module.exports = OrderController

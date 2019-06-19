'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order')
const Cupon = use('App/Models/Cupon')
const Discount = use('App/Models/Discount')

const OrderTransformer = use('App/Transformers/Admin/OrderTransformer')
const OrderService = use('App/Services/Order/OrderService')

const Database = use('Database')
const Ws = use('Ws')

class OrderController {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index({ response, pagination, transform, auth }) {
    const { page, limit } = pagination
    const user = await auth.getUser()

    const query = Order.query().where('user_id', user.id)

    try {
      let orders = await query.paginate(page, limit)

      orders = await transform.paginate(orders, OrderTransformer)

      return response.status(200).send(orders)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível buscar os pedidos' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform, auth }) {
    const trx = await Database.beginTransaction()

    const items = request.input('items')

    try {
      const user = await auth.getUser()

      let order = await Order.create(
        {
          user_id: user.id
        },
        trx
      )

      const service = new OrderService(order, trx)

      if (items && items.length) {
        await service.syncItems(items)
      }

      await trx.commit()

      order = await Order.find(order.id)

      order = await transform.include('items').item(order, OrderTransformer)

      const topic = Ws.getChannel('notifications').topic('notifications')

      if (topic) topic.broadcast('new:order', order)

      return response.status(201).send(order)
    } catch (err) {
      console.log(err)
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
  async show({ params, response, auth, transform }) {
    try {
      const user = await auth.getUser()

      let order = await Order.query()
        .where({ user_id: user.id, id: params.id })
        .firstOrFail()

      order = await transform
        .include('items,user,discounts')
        .item(order, OrderTransformer)

      return response.status(200).send(order)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível exibir o pedido' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async update({ params, request, auth, response, transform }) {
    const trx = await Database.beginTransaction()

    const { status } = request.all()

    if (status === 'paid' || status === 'shipped')
      return response.status(403).send({ message: 'Não autorizado' })

    try {
      const user = await auth.getUser()

      let order = await Order.query()
        .where({ user_id: user.id, id: params.id })
        .firstOrFail()

      order.merge({ status })

      await order.save(trx)

      await trx.commit()

      order = await transform
        .include('items,discounts,cupons')
        .item(order, OrderTransformer)

      return response.status(200).send(order)
    } catch (err) {
      console.log(err)
      await trx.rollback()

      return response
        .status(400)
        .send({ message: 'Não foi possível editar o pedido' })
    }
  }

  async applyDiscount({ params, request, auth, response, transform }) {
    const code = request.input('code')

    let discount,
      info = {}

    try {
      const cupon = await Cupon.findByOrFail('code', code.toUpperCase())

      const user = await auth.getUser()

      let order = await Order.query()
        .where({ user_id: user.id, id: params.id })
        .firstOrFail()

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
      } else {
        info.message = 'Não foi possível aplicar o cupon'
        info.success = false
      }

      await order.save()

      order = await Order.find(order.id)

      order = await transform
        .include('items,discounts,cupons')
        .item(order, OrderTransformer)

      return response.status(200).send({ order, info })
    } catch (err) {
      console.log(err)
      info.message = 'Erro ao aplicar o cupon'
      info.success = false

      return response.status(400).send(info)
    }
  }

  async removeDiscount({ request, response, auth }) {
    const { discount_id } = request.all()

    try {
      const discount = await Discount.findOrFail(discount_id)

      const order = await Order.findOrFail(discount.order_id)

      const user = await auth.getUser()

      if (order.user_id !== user.id)
        return response.status(403).send({ message: 'Não autorizado' })

      await discount.delete()

      return response.status(204).send()
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível remover o desconto' })
    }
  }
}

module.exports = OrderController

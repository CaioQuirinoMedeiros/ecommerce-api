'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Order = use('App/Models/Order')
const Database = use('Database')
const OrderService = use('App/Services/Order/OrderService')

const Cupon = use('App/Models/Cupon')
const Discount = use('App/Models/Discount')

const OrderTransformer = use('App/Transformers/Admin/OrderTransformer')

class OrderController {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const { page, limit } = pagination
    const status = request.input('status')

    const query = Order.query()

    if (status) {
      query.where('status', status)
    }

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
  async store({ request, response, transform }) {
    const trx = await Database.beginTransaction()

    const { user_id, items, status } = request.all()

    try {
      let order = await Order.create(
        {
          user_id,
          status
        },
        trx
      )

      const service = new OrderService(order, trx)

      if (items && items.length) {
        await service.syncItems(items)
      }

      await trx.commit()

      order = await Order.find(order.id)

      order = await transform
        .include('user,items')
        .item(order, OrderTransformer)

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
  async show({ params, response, transform }) {
    try {
      let order = await Order.findOrFail(params.id)

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
  async update({ params, request, response, transform }) {
    const trx = await Database.beginTransaction()

    const { user_id, items, status } = request.all()

    try {
      let order = await Order.findOrFail(params.id)

      order.merge({ user_id, status })

      const service = new OrderService(order, trx)

      await service.syncItems(items)

      await order.save(trx)

      await trx.commit()

      order = await transform
        .include('items,user,discounts,cupons')
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

  /**
   * @param {object} ctx
   * @param {object} ctx.params
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const trx = await Database.beginTransaction()

    try {
      const order = await Order.findOrFail(params.id)

      await order.items().delete(trx)
      await order.cupons().delete(trx)
      await order.delete(trx)

      await trx.commit()

      return response.status(204).send()
    } catch (err) {
      console.log(err)
      await trx.rollback()

      return response
        .status(400)
        .send({ message: 'Não foi possível deletar o pedido' })
    }
  }

  async applyDiscount({ params, request, response, transform }) {
    const code = request.input('code')

    let discount,
      info = {}

    try {
      const cupon = await Cupon.findByOrFail('code', code.toUpperCase())

      let order = await Order.findOrFail(params.id)

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
        .include('items,user,discounts,cupons')
        .item(order, OrderTransformer)

      return response.status(200).send({ order, info })
    } catch (err) {
      console.log(err)
      info.message = 'Erro ao aplicar o cupon'
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
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível remover o desconto' })
    }
  }
}

module.exports = OrderController

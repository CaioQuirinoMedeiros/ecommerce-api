'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Cupon = use('App/Models/Cupon')
const Database = use('Database')
const Service = use('App/Services/Cupon/CuponService')

const CuponTransformer = use('App/Transformers/Admin/CuponTransformer')

class CuponController {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const code = request.input('code')
    const { page, limit } = pagination

    const query = Cupon.query()

    if (code) {
      query.where('code', 'iLIKE', `%${code}%`)
    }

    let cupons = query.paginate(page, limit)

    cupons = await transform.paginate(cupons, CuponTransformer)

    return response.status(200).send(cupons)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    /**
     * Relationships: products, clients, products and clients, anyone and anyproduct
     */

    const trx = await Database.beginTransaction()

    let can_use_for = 'all'

    try {
      const cuponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive'
      ])

      const { users, products } = request.only(['users', 'products'])

      const service = new Service(Cupon, trx)

      if (products && products.length) {
        await service.syncProducts(products)
        can_use_for = 'product'
      }

      if (users && users.length) {
        await service.syncUsers(users)
        can_use_for = can_use_for === 'product' ? 'product_client' : 'client'
      }

      let cupon = await Cupon.create({ ...cuponData, can_use_for }, trx)

      await trx.commit()

      cupon = await transform
        .include('users,products')
        .item(cupon, CuponTransformer)

      return response.status(201).send(cupon)
    } catch (err) {
      await trx.rollback()

      return response
        .status(400)
        .send({ message: 'Não foi possível criar o cupon' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async show({ params, response }) {
    let cupon = await Cupon.findOrFail(params.id)

    cupon = await transform
      .include('users,products,orders')
      .item(cupon, CuponTransformer)

    return response.send(cupon)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async update({ params, request, response, transform }) {
    let cupon = await Cupon.findOrFail(params.id)

    const trx = await Database.beginTransaction()

    let can_use_for = cupon.can_use_for

    try {
      const cuponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive'
      ])

      const { users, products } = request.only(['users', 'products'])

      const service = new Service(Cupon, trx)

      if (products && products.length) {
        await service.syncProducts(products)
        can_use_for = can_use_for === 'client' ? 'product_client' : 'product'
      }

      if (users && users.length) {
        await service.syncUsers(users)
        can_use_for = can_use_for === 'product' ? 'product_client' : 'client'
      }

      cupon.merge({ ...cuponData, can_use_for })

      await cupon.save(trx)

      await trx.commit()

      cupon = await transform
        .include('users,products')
        .item(cupon, CuponTransformer)

      return response.status(201).send(cupon)
    } catch (err) {
      await trx.rollback()

      return response
        .status(400)
        .send({ message: 'Não foi possível editar o cupon' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async destroy({ params, response }) {
    const trx = await Database.beginTransaction()
    const cupon = await Cupon.findOrFail(params.id)

    try {
      await cupon.products().detach([], trx)
      await cupon.orders().detach([], trx)
      await cupon.users().detach([], trx)

      await cupon.delete(trx)

      await trx.commit()

      return response.status(204).send()
    } catch (err) {
      trx.rollback()

      return response
        .status(500)
        .send({ message: 'Não foi possível deletar o cupon' })
    }
  }
}

module.exports = CuponController

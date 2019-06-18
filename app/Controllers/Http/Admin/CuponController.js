'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Cupon = use('App/Models/Cupon')
const Database = use('Database')
const CuponService = use('App/Services/Cupon/CuponService')

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

    try {
      let cupons = await query.paginate(page, limit)

      cupons = await transform.paginate(cupons, CuponTransformer)

      return response.status(200).send(cupons)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível buscar os cupons' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    const trx = await Database.beginTransaction()

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

    let can_use_for = 'all'

    try {
      let cupon = await Cupon.create({ ...cuponData, can_use_for }, trx)

      const service = new CuponService(cupon, trx)

      if (products && products.length) {
        const productsAdded = await service.syncProducts(products)
        if (productsAdded) cupon.can_use_for = 'product'
      }

      if (users && users.length) {
        const clientsAdded = await service.syncUsers(users)
        if (clientsAdded)
          cupon.can_use_for =
            cupon.can_use_for === 'product' ? 'product_client' : 'client'
      }

      await cupon.save(trx)

      await trx.commit()

      cupon = await Cupon.find(cupon.id)

      cupon = await transform
        .include('users,products')
        .item(cupon, CuponTransformer)

      return response.status(201).send(cupon)
    } catch (err) {
      console.log(err)
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
  async show({ params, response, transform }) {
    try {
      let cupon = await Cupon.findOrFail(params.id)

      cupon = await transform
        .include('users,products')
        .item(cupon, CuponTransformer)

      return response.status(200).send(cupon)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível encontrar o cupon' })
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

    try {
      let cupon = await Cupon.findOrFail(params.id)

      cupon.merge(cuponData)

      const service = new CuponService(cupon, trx)

      if (products && products.length) {
        const productsAdded = await service.syncProducts(products)
        if (productsAdded)
          cupon.can_use_for = cupon.can_use_for.includes('client')
            ? 'product_client'
            : 'product'
      }

      if (users && users.length) {
        const clientsAdded = await service.syncUsers(users)
        if (clientsAdded)
          cupon.can_use_for = cupon.can_use_for.includes('product')
            ? 'product_client'
            : 'client'
      }

      await cupon.save(trx)

      await trx.commit()

      cupon = await transform
        .include('users,products')
        .item(cupon, CuponTransformer)

      return response.status(200).send(cupon)
    } catch (err) {
      console.log(err)

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

    try {
      const cupon = await Cupon.findOrFail(params.id)

      await cupon.products().detach([], trx)
      await cupon.orders().detach([], trx)
      await cupon.users().detach([], trx)

      await cupon.delete(trx)

      await trx.commit()

      return response.status(204).send()
    } catch (err) {
      console.log(err)
      trx.rollback()

      return response
        .status(400)
        .send({ message: 'Não foi possível deletar o cupon' })
    }
  }
}

module.exports = CuponController

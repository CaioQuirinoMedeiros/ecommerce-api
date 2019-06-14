'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Product = use('App/Models/Product')

class ProductController {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Pagination} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const name = request.input('name')
    const { page, limit } = pagination

    const query = Product.query()

    if (name) {
      query.where('name', 'iLIKE', `%${name}%`)
    }

    const products = await query.paginate(page, limit)

    return response.status(200).send(products)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const { name, description, price, image_id } = request.all()

      const product = await Product.create({
        name,
        description,
        price,
        image_id
      })

      return response.status(201).send({ product })
    } catch (err) {
      return response
        .status(400)
        .send({ message: 'Erro ao processar solicitação' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Params} ctx.params
   * @param {Response} ctx.response
   */
  async show({ params, response }) {
    const product = await Product.findOrFail(params.id)

    await product.load('categories')

    return response.send(product)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Params} ctx.params
   */
  async destroy({ params, response }) {
    const product = await Product.findOrFail(params.id)

    try {
      await product.delete()

      return response.status(204).send()
    } catch (err) {
      return response
        .status(500)
        .send({ message: 'Não foi possível deletar o produto' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Params} ctx.params
   */
  async update({ params, request, response }) {
    try {
      const { name, description, price, image_id } = request.all()
      const product = await Product.findOrFail(params.id)

      product.merge({ name, description, price, image_id })

      await product.save()

      return response.status(201).send(product)
    } catch (err) {
      return response
        .status(400)
        .send({ message: 'Erro ao processar solicitação' })
    }
  }
}

module.exports = ProductController

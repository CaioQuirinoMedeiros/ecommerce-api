'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Product = use('App/Models/Product')
const ProductTransformer = use('App/Transformers/Admin/ProductTransformer')

class ProductController {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Pagination} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const name = request.input('name')
    const { page, limit } = pagination

    const query = Product.query()

    if (name) {
      query.where('name', 'iLIKE', `%${name}%`)
    }

    let products = await query.paginate(page, limit)

    products = await transform.paginate(products, ProductTransformer)

    return response.status(200).send(products)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    try {
      const { name, description, price, image_id } = request.all()

      let product = await Product.create({
        name,
        description,
        price,
        image_id
      })

      product = await transform.item(product, ProductTransformer)

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
  async show({ params, response, transform }) {
    let product = await Product.findOrFail(params.id)

    product = await transform.item(product, ProductTransformer)

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
  async update({ params, request, response, transform }) {
    try {
      const { name, description, price, image_id } = request.all()
      let product = await Product.findOrFail(params.id)

      product.merge({ name, description, price, image_id })

      await product.save()

      product = await transform.item(product, ProductTransformer)

      return response.status(201).send(product)
    } catch (err) {
      return response
        .status(400)
        .send({ message: 'Erro ao processar solicitação' })
    }
  }
}

module.exports = ProductController

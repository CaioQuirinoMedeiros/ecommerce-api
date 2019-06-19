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
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const name = request.input('name')
    const { page, limit } = pagination

    const query = Product.query()

    if (name) {
      query.where('name', 'iLIKE', `%${name}%`)
    }

    try {
      let products = await query.paginate(page, limit)

      products = await transform.paginate(products, ProductTransformer)

      return response.status(200).send(products)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível buscar os produtos' })
    }
  }

  /**
   * @param {object} ctx
   * @param {object} ctx.params
   * @param {Response} ctx.response
   */
  async show({ params, response, transform }) {
    try {
      let product = await Product.findOrFail(params.id)

      product = await transform.item(product, ProductTransformer)

      return response.status(200).send(product)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível encontrar o produto' })
    }
  }
}

module.exports = ProductController

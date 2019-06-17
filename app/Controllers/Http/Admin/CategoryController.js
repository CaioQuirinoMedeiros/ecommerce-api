'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Category = use('App/Models/Category')
const CategoryTransformer = use('App/Transformers/Admin/CategoryTransformer')

class CategoryController {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Pagination} ctx.pagination
   * @param {TransformWith} ctx.transform
   */
  async index({ request, response, transform, pagination }) {
    const title = request.input('title')
    const { page, limit } = pagination

    const query = Category.query()

    if (title) {
      query.where('title', 'iLIKE', `%${title}%`)
    }

    let categories = await query.paginate(page, limit)
    categories = await transform.paginate(categories, CategoryTransformer)

    return response.status(200).send(categories)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async store({ request, response, transform }) {
    try {
      const { title, description, image_id } = request.all()

      let category = await Category.create({ title, description, image_id })
      category = await transform.item(category, CategoryTransformer)

      return response.status(201).send(category)
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
   * @param {TransformWith} ctx.transform
   */
  async show({ params, response, transform }) {
    let category = await Category.findOrFail(params.id)

    // await category.load('products')

    category = await transform.item(category, CategoryTransformer)

    return response.send(category)
  }

  /**
   * @param {object} ctx
   * @param {Params} ctx.params
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const category = await Category.findOrFail(params.id)

    try {
      await category.delete()

      return response.status(204).send()
    } catch (err) {
      return response
        .status(500)
        .send({ message: 'Não foi possível deletar a categoria' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Params} ctx.params
   * @param {TransformWith} ctx.transform
   */
  async update({ params, request, response, transform }) {
    try {
      const { title, description, image_id } = request.all()
      let category = await Category.findOrFail(params.id)

      category.merge({ title, description, image_id })

      await category.save()

      category = await transform.item(category, CategoryTransformer)

      return response.status(201).send(category)
    } catch (err) {
      return response
        .status(400)
        .send({ message: 'Erro ao processar solicitação' })
    }
  }
}

module.exports = CategoryController

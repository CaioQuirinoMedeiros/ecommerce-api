'use strict'

const Category = use('App/Models/Category')

class CategoryController {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Pagination} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const title = request.input('title')
    const { page, limit } = pagination

    const query = Category.query()

    if (title) {
      query.where('title', 'iLIKE', `%${title}%`)
    }

    const categories = await query.paginate(page, limit)

    return response.status(200).send(categories)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const { title, description, image_id } = request.all()

      const category = await Category.create({ title, description, image_id })

      return response.status(201).send({ category })
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
    const category = await Category.findOrFail(params.id)

    await category.load('products')

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
   */
  async update({ params, request, response }) {
    try {
      const { title, description, image_id } = request.all()
      const category = await Category.findOrFail(params.id)

      category.merge({ title, description, image_id })

      await category.save()

      return response.status(201).send(category)
    } catch (err) {
      return response
        .status(400)
        .send({ message: 'Erro ao processar solicitação' })
    }
  }
}

module.exports = CategoryController

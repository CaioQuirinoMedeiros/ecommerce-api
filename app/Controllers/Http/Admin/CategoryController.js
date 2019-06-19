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
   * @param {object} ctx.pagination
   */
  async index({ request, response, transform, pagination }) {
    const title = request.input('title')
    const { page, limit } = pagination

    const query = Category.query()

    if (title) {
      query.where('title', 'iLIKE', `%${title}%`)
    }

    try {
      let categories = await query.paginate(page, limit)

      categories = await transform.paginate(categories, CategoryTransformer)

      return response.status(200).send(categories)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível buscar as categorias' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    const { title, description, image_id } = request.all()

    try {
      let category = await Category.create({ title, description, image_id })

      category = await transform.item(category, CategoryTransformer)

      return response.status(201).send(category)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível criar a categoria' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Params} ctx.params
   * @param {Response} ctx.response
   */
  async show({ params, response, transform }) {
    try {
      let category = await Category.findOrFail(params.id)

      category = await transform.item(category, CategoryTransformer)

      return response.status(200).send(category)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível encontrar a categoria' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Params} ctx.params
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    try {
      const category = await Category.findOrFail(params.id)

      await category.delete()

      return response.status(204).send()
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível deletar a categoria' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Params} ctx.params
   */
  async update({ params, request, response, transform }) {
    const { title, description, image_id } = request.all()

    try {
      let category = await Category.findOrFail(params.id)

      category.merge({ title, description, image_id })

      await category.save()

      category = await transform.item(category, CategoryTransformer)

      return response.status(200).send(category)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível editar a categoria' })
    }
  }
}

module.exports = CategoryController

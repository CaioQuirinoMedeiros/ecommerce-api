'use strict'

const Category = use('App/Models/Category')

class CategoryController {
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

  async show({ params, response }) {
    const category = await Category.findOrFail(params.id)

    return response.send(category)
  }

  async destroy({ params, response }) {
    const category = await Category.findOrFail(params.id)

    await category.delete()

    return response.status(204).send()
  }

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

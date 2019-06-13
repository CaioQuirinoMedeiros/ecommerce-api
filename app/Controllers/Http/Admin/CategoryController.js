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
}

module.exports = CategoryController

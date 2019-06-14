'use strict'

const Product = use('App/Models/Product')

class ProductController {
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

  async show({ params, response }) {
    const product = await Product.findOrFail(params.id)

    return response.send(product)
  }

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

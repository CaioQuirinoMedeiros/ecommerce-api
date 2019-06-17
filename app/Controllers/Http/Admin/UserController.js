'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const User = use('App/Models/User')
const UserTransformer = use('App/Transformers/Admin/UserTransformer')

class UserController {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Pagination} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const name = request.input('name')
    const { page, limit } = pagination

    const query = User.query()

    if (name) {
      query.where('name', 'iLIKE', `%${name}%`)
      query.orWhere('surname', 'iLIKE', `%${name}%`)
      query.orWhere('email', 'iLIKE', `%${name}%`)
    }

    let users = await query.paginate(page, limit)

    users = await transform.paginate(users, UserTransformer)

    return response.send(users)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    try {
      const { name, surname, email, password, image_id } = request.all()

      let user = await User.create({
        name,
        surname,
        email,
        password,
        image_id
      })

      user = await transform.item(user, UserTransformer)

      return response.status(201).send(user)
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
    let user = await User.findOrFail(params.id)

    user = await transform.item(user, UserTransformer)

    return response.send(user)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Params} ctx.params
   */
  async update({ params, request, response, transform }) {
    try {
      const { name, surname, email, password, image_id } = request.all()
      let user = await User.findOrFail(params.id)

      user.merge({ name, surname, email, password, image_id })

      await user.save()

      user = await transform.item(user, UserTransformer)

      return response.status(201).send(user)
    } catch (err) {
      return response
        .status(400)
        .send({ message: 'Erro ao processar solicitação' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const user = await User.findOrFail(params.id)

    try {
      await user.delete()

      return response.status(204).send()
    } catch (err) {
      return response
        .status(500)
        .send({ message: 'Não foi possível deletar o produto' })
    }
  }
}

module.exports = UserController

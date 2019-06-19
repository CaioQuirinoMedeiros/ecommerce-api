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
   * @param {object} ctx.pagination
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

    try {
      let users = await query.paginate(page, limit)

      users = await transform.paginate(users, UserTransformer)

      return response.status(200).send(users)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível buscar os usuários' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    const { name, surname, email, password, image_id } = request.all()

    try {
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
        .send({ message: 'Não foi possível criar o usuário' })
    }
  }

  /**
   * @param {object} ctx
   * @param {object} ctx.params
   * @param {Response} ctx.response
   */
  async show({ params, response, transform }) {
    try {
      let user = await User.findOrFail(params.id)

      user = await transform.item(user, UserTransformer)

      return response.status(200).send(user)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível encontrar o usuário' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.params
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
        .send({ message: 'Não foi possível editar o usuário' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async destroy({ params, response }) {
    try {
      const user = await User.findOrFail(params.id)

      await user.delete()

      return response.status(204).send()
    } catch (err) {
      return response
        .status(400)
        .send({ message: 'Não foi possível deletar o usuário' })
    }
  }
}

module.exports = UserController

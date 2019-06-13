'use strict'

const Database = use('Database')
const User = use('App/Models/User')
const Role = use('Role')

class AuthController {
  async register({ request, response }) {
    const trx = Database.beginTransaction()

    try {
      const { name, surname, email, password } = request.all()

      const user = await User.create({ name, surname, email, password }, trx)

      const clientRole = await Role.findBy('slug', 'client')

      await user.roles().attach([clientRole.id], null, trx)

      await trx.commit()

      return user
    } catch (err) {
      await trx.rollback()

      return response.status(400).send({ message: 'Erro ao realizar cadastro' })
    }
  }

  async login({ request, response, auth }) {
    const { email, password } = request.all()

    const token = await auth.withRefreshToken().attempt(email, password)

    return token
  }

  async refresh({ request, response, auth }) {}

  async logout({ request, response, auth }) {}

  async forgot({ request, response }) {}

  async remeber({ request, response }) {}

  async reset({ request, response }) {}
}

module.exports = AuthController

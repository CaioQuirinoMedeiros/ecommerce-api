'use strict'

const UserTransformer = use('App/Transformers/Admin/UserTransformer')

class UserController {
  async me({ response, transform, auth }) {
    try {
      let user = await auth.getUser()

      const userData = await transform.item(user, UserTransformer)

      userData.roles = await user.getRoles()

      return response.status(200).send(userData)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível retornar o usuário logado' })
    }
  }
}

module.exports = UserController

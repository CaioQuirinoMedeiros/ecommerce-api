'use strict'

class StoreUser {
  get validateAll() {
    return true
  }

  get rules() {
    let userID = this.ctx.params.id
    let emailRule = ''

    if (userID) {
      emailRule = `email|unique:users,email,id,${userID}`
    } else {
      emailRule = 'email|unique:users,email|required'
    }
    return {
      email: emailRule,
      name: 'required|string',
      surname: 'required|string',
      image_id: 'exists:images,id'
    }
  }

  get messages() {
    return {
      'name.required': 'O nome é obrigatório!',
      'name.string': 'O nome tem que ser um texto!',
      'surname.required': 'O sobrenome é obrigatório!',
      'surname.string': 'O sobrenome tem que ser um texto!',
      'email.required': 'O email é obrigatório!',
      'email.email': 'O email é inválido!',
      'email.unique': 'Este email já existe!',
      'image_id.exists': 'A imagem não existe!'
    }
  }
}

module.exports = StoreUser

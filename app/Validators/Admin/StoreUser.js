'use strict'

class AdminStoreUser {
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
      image_id: 'exists:images,id'
    }
  }

  get messages() {
    return {
      'email.unique': 'Este email já existe!',
      'email.required': 'O email é obrigatório!',
      'email.email': 'O email é inválido!',
      'image_id.exists': 'A imagem não existe!'
    }
  }
}

module.exports = AdminStoreUser

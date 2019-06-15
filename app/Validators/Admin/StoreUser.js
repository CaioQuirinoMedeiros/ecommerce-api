'use strict'

class AdminStoreUser {
  get validateAll() {
    return true
  }

  get rules() {
    let userID = this.ctx.params.id
    let rule = ''

    if (userID) {
      rule = `unique:users,email,id,${userID}`
    } else {
      rule = 'unique:users,email|required'
    }
    return {
      email: rule,
      image_id: 'exists:images,id'
    }
  }

  get messages() {
    return {
      'email.unique': 'Este email já existe!',
      'email.required': 'O email é obrigatório',
      'image_id.exists': 'A imagem não existe'
    }
  }
}

module.exports = AdminStoreUser

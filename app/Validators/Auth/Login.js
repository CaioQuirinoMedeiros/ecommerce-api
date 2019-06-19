'use strict'

class Login {
  get validateAll() {
    return true
  }

  get rules() {
    return {
      email: 'required|email',
      password: 'required'
    }
  }

  get messages() {
    return {
      'email.required': 'O email é obrigatório!',
      'email.email': 'O email é inválido!',
      'password.required': 'A senha é obrigatória!'
    }
  }
}

module.exports = Login

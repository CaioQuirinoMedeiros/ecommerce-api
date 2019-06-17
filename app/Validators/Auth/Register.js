'use strict'

class Register {
  get validateAll() {
    return true
  }

  get rules() {
    return {
      name: 'required|string',
      surname: 'required|string',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed'
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
      'password.required': 'A senha é obrigatória!',
      'password.confirmed': 'As senhas não são iguais!'
    }
  }
}

module.exports = Register

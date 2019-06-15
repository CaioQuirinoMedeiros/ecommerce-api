'use strict'

class Register {
  get rules() {
    return {
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required',
      password_confirmation: 'required'
    }
  }
}

module.exports = Register

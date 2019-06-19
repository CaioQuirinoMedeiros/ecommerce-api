'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Pagination {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle(ctx, next) {
    if (ctx.request.method() === 'GET') {
      const page = parseInt(ctx.request.input('page'))
      const limit = parseInt(ctx.request.input('limit'))
      const perPage = parseInt(ctx.request.input('perPage'))

      ctx.pagination = { page: page || 1, limit: limit || perPage || 10 }
    }
    await next()
  }
}

module.exports = Pagination

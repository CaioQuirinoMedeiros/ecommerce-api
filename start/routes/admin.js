'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  /**
   * Categories resource routes
   */
  Route.resource('categories', 'CategoryController')
    .apiOnly()
    .validator(
      new Map([
        [['categories.store', 'categories.update'], ['Admin/StoreCategory']]
      ])
    )

  /**
   * Products resource routes
   */
  Route.resource('products', 'ProductController')
    .apiOnly()
    .validator(
      new Map([[['products.store', 'products.update'], ['Admin/StoreProduct']]])
    )

  /**
   * Cupons resource routes
   */
  Route.resource('cupons', 'CuponController').apiOnly()

  /**
   * Order resource routes
   */
  Route.post('orders/:id/discount', 'OrderController.applyDiscount')
  Route.delete('orders/:id/discount', 'OrderController.removeDiscount')
  Route.resource('orders', 'OrderController')
    .apiOnly()
    .validator(new Map([[['orders.store'], ['Admin/StoreOrder']]]))

  /**
   * Image resource routes
   */
  Route.resource('images', 'ImageController').apiOnly()

  /**
   * User resource routes
   */
  Route.resource('users', 'UserController')
    .apiOnly()
    .validator(
      new Map([[['users.store', 'users.update'], ['Admin/StoreUser']]])
    )
})
  .prefix('v1/admin')
  .namespace('Admin')
  .middleware(['auth', 'is:(admin || manager)'])

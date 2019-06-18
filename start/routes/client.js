'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  /**
   * Product resource routes
   */
  Route.resource('products', 'ProductController').only(['index', 'show'])

  /**
   * Order resource routes
   */
  Route.post('orders/:id/discount', 'OrderController.applyDiscount')
  Route.delete('orders/:id/discount', 'OrderController.removeDiscount')
  Route.resource('orders', 'OrderController')
    .only(['index', 'show', 'update', 'store'])
    .middleware(['auth'])
})
  .prefix('v1')
  .namespace('Client')

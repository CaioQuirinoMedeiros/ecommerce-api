'use strict'

const DiscountHook = (exports = module.exports = {})

const Cupon = use('App/Models/Cupon')
const Order = use('App/Models/Order')
const Database = use('Database')

DiscountHook.calculateValues = async model => {
  let cuponProductsIds,
    discountItems = []

  model.discount = 0

  const cupon = await Cupon.findOrFail(model.cupon_id)
  const order = await Order.findOrFail(model.order_id)
  console.log('***************CUPON****************')
  console.log(cupon)
  console.log('***************ORDER****************')
  console.log(order)

  console.log('***************CUPON_can_use_for****************')
  console.log(cupon.can_use_for)

  if (
    cupon.can_use_for === 'product_client' ||
    cupon.can_use_for === 'product'
  ) {
    cuponProductsIds = await Database.from('cupon_product')
      .where('cupon_id', cupon.id)
      .pluck('product_id')

    discountItems = await Database.from('order_items')
      .where('order_id', order.id)
      .whereIn('product_id', cuponProductsIds)

    for (let orderItem of discountItems) {
      model.discount +=
        cupon.type === 'percent'
          ? cupon.discount * orderItem.subtotal
          : cupon.type === 'currency'
          ? cupon.discount * orderItem.quantity
          : orderItem.subtotal
    }
  } else {
    model.discount =
      cupon.type === 'percent'
        ? order.subtotal * cupon.discount
        : cupon.type === 'currency'
        ? cupon.discount
        : order.subtotal
  }

  return model
}

DiscountHook.decreaseCuponQuantity = async model => {
  const query = Database.from('cupons')

  if (model.$transaction) {
    query.transacting(model.$transaction)
  }

  await query.where('id', model.cupon_id).decrement('quantity', 1)
}

DiscountHook.increaseCuponQuantity = async model => {
  const query = Database.from('cupons')

  if (model.$transaction) {
    query.transacting(model.$transaction)
  }

  await query.where('id', model.cupon_id).increment('quantity', 1)
}

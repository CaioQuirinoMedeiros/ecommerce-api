'use strict'

const DiscountHook = (exports = module.exports = {})

const Cupon = use('App/Models/Cupon')
const Order = use('App/Models/Order')

DiscountHook.calculateValues = async model => {
  let cuponProductsIds,
    discountItems = []

  model.discount = 0

  const cupon = await Cupon.findOrFail(model.cupon_id)
  const order = await Order.findOrFail(model.order_id)

  switch (cupon.can_use_for) {
    case 'product_client' || 'product':
      cuponProductsIds = await Database.from('cupon_product')
        .where('cupon_id', model.cupon_id)
        .pluck('product_id')
      discountItems = await Database.from('order_items')
        .where('order_id', model.order_id)
        .whereIn('product_id', cuponProductsIds)

      for (let orderItem of discountItems) {
        model.discount +=
          cupon.type === 'percentage'
            ? ((cupon.discount / 100) * orderItem.subtotal) / 100
            : cupon.type === 'currency'
            ? cupon.discount * orderItem.quantity
            : orderItem.subtotal
      }

      break
    default:
      model.discount =
        cupon.type === 'percentage'
          ? order.subtotal * cupon.discount
          : cupon.type === 'currency'
          ? cupon.discount
          : order.subtotal
      break
  }

  return model
}

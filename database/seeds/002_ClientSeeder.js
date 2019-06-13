'use strict'

/*
|--------------------------------------------------------------------------
| ClientSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Role = use('Role')
const User = use('App/Models/User')

class ClientSeeder {
  async run() {
    const clientRole = await Role.findBy('slug', 'client')

    const Clients = await Factory.model('App/Models/User').createMany(30)

    await Promise.all(
      clients.map(async client => {
        await client.roles().attach([role.id])
      })
    )

    const adminRole = await Role.findBy('slug', 'admin')
    const adminUser = await User.create({
      name: 'Caio',
      surname: 'Medeiros',
      email: 'caio1@gmail.com',
      password: 'pedemanga'
    })

    await adminUser.roles().attach([adminRole])
  }
}

module.exports = ClientSeeder

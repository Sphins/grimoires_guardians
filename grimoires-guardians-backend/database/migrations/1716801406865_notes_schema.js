'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NotesSchema extends Schema {
  up() {
    this.create('notes', (table) => {
      table.increments()
      table.string('img', 40)
      table.text('data')
      table.timestamps()
    })
  }

  down() {
    this.drop('notes')
  }
}

module.exports = NotesSchema

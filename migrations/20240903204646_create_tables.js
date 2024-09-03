/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema
    .createTable("warehouses", (table) => {
      table.increments("id"); //primary key
      table.string("warehouse_name").notNullable();
      table.string("address").notNullable();
      table.string("city").notNullable();
      table.string("country").notNullable();
      table.string("contact_name").notNullable();
      table.string("contact_position").notNullable();
      table.string("contact_email").notNullable();
      table.string("contact_phone").notNullable();
      table.dateTime("created_at").defaultTo(knex.fn.now());
      table
        .timestamp("updated_at")
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    })
    .createTable("inventories", (table) => {
        table.increments('id'); //primary key
        table.integer('warehouse_id').unsigned().notNullable();
        table
          .foreign('warehouse_id')
          .references('id')
          .inTable('warehouses')
          .onUpdate('CASCADE')
          .onDelete('CASCADE'); 
        table.string('item_name').notNullable(); 
        table.string('description').notNullable(); 
        table.string('category').notNullable(); 
        table.integer('quantity').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table
        .timestamp("updated_at")
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    });
}

export function down(knex) {
  return knex.schema.dropTable("warehouses").dropTable("inventories");
}

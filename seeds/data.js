/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Deletes ALL existing entries in the inventories and warehouses tables
  await knex('inventories').del();
  await knex('warehouses').del();

  // Insert seed entries into the warehouses table
  await knex('warehouses').insert([
    { warehouse_name: 'Warehouse A', address: '123 Main St', city: 'Anytown', country: 'USA', contact_name: 'John Doe', contact_position: 'Manager', contact_email: 'johndoe@example.com', contact_phone: '123-456-7890' },
    { warehouse_name: 'Warehouse B', address: '456 Elm St', city: 'Othertown', country: 'Canada', contact_name: 'Jane Smith', contact_position: 'Supervisor', contact_email: 'janesmith@example.com', contact_phone: '987-654-3210' },
  ]);

  // Insert seed entries into the inventories table
  await knex('inventories').insert([
    { warehouse_id: 1, item_name: 'Item 1', description: 'Description of Item 1', category: 'Category A', quantity: 100 },
    { warehouse_id: 1, item_name: 'Item 2', description: 'Description of Item 2', category: 'Category B', quantity: 200 },
    { warehouse_id: 2, item_name: 'Item 3', description: 'Description of Item 3', category: 'Category A', quantity: 150 },
    { warehouse_id: 2, item_name: 'Item 4', description: 'Description of Item 4', category: 'Category C', quantity: 300 },
  ]);
}

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('github_users', table => {
      table.increments('id').primary();
      table.string('username', 255).notNullable().unique();
      table.string('name', 255);
      table.string('bio', 255);
      table.string('location', 255);
      table.string('company', 255);
      table.integer('followers');
      table.integer('following');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('user_languages', table => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('github_users').onDelete('CASCADE');
      table.string('language', 255).notNullable();
      table.unique(['user_id', 'language']);
    });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('user_languages')
    .dropTableIfExists('github_users');
}

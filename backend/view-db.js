import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'data/database.sqlite');
const db = new Database(dbPath);

console.log('=== VISUALIZAÇÃO DO BANCO DE DADOS ===\n');

const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%'
`).all();

console.log('📊 TABELAS DISPONÍVEIS:');
tables.forEach(table => {
  console.log(`  - ${table.name}`);
});
console.log('');

for (const table of tables) {
  const tableName = table.name;
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
  
  console.log(`\n📋 TABELA: ${tableName.toUpperCase()} (${count.count} registros)`);
  console.log('─'.repeat(80));
  
  if (count.count === 0) {
    console.log('  (vazia)\n');
    continue;
  }
  
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const columnNames = columns.map(col => col.name);
  
  const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT 20`).all();
  
  if (tableName === 'users') {
    rows.forEach(row => {
      console.log(`  ID: ${row.id} | Username: ${row.username} | Criado em: ${row.created_at}`);
    });
  } else if (tableName === 'movies') {
    rows.forEach(row => {
      console.log(`  ID: ${row.id} | TMDB ID: ${row.tmdb_id} | Título: ${row.title}`);
      console.log(`    Criado por: ${row.created_by} | Data: ${row.created_at}`);
    });
  } else if (tableName === 'search_logs') {
    rows.forEach(row => {
      console.log(`  ID: ${row.id} | User ID: ${row.user_id || 'N/A'} | Query: "${row.query}"`);
      console.log(`    Resultados: ${row.results_count} | IP: ${row.ip_address} | Data: ${row.created_at}`);
    });
  } else if (tableName === 'auth_logs') {
    rows.forEach(row => {
      const status = row.success ? '✅ SUCESSO' : '❌ FALHA';
      console.log(`  ID: ${row.id} | Username: ${row.username || 'N/A'} | ${status}`);
      console.log(`    IP: ${row.ip_address} | Data: ${row.created_at}`);
    });
  } else {
    rows.forEach((row, index) => {
      console.log(`  Registro ${index + 1}:`, row);
    });
  }
  
  if (count.count > 20) {
    console.log(`  ... e mais ${count.count - 20} registros`);
  }
}

console.log('\n' + '='.repeat(80));
db.close();


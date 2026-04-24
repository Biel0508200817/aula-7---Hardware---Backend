const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY não estão definidas.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
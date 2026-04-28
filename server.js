import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import { createClient } from '@supabase/supabase-js';

const app = express();

// ================= CONFIG ================= //
app.use(cors());
app.use(express.json());

// ================= SUPABASE ================= //
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ================= ROTAS ================= //

app.get('/api/produtos', async (req, res) => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*, categorias ( id, nome )');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.get('/api/categorias', async (req, res) => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.get('/api/produtos/categoria/:nomeCategoria', async (req, res) => {
  const { nomeCategoria } = req.params;

  const { data, error } = await supabase
    .from('produtos')
    .select('*, categorias!inner ( nome )')
    .ilike('categorias.nome', `%${nomeCategoria}%`);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.post('/api/produtos', async (req, res) => {
  const { nome, preco, categoria_id } = req.body;

  if (!nome || preco == null || !categoria_id) {
    return res.status(400).json({ error: "Dados obrigatórios faltando" });
  }

  const { data, error } = await supabase
    .from('produtos')
    .insert([{ nome, preco, categoria_id }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
});

// ================= EXPORT (OBRIGATÓRIO) ================= //
export default serverless(app);

import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import { createClient } from '@supabase/supabase-js';

const app = express();

// ================= ENV ================= //
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('Variáveis do Supabase não definidas');
}

// ================= SUPABASE ================= //
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ================= MIDDLEWARE ================= //
app.use(cors());
app.use(express.json());

// ================= LOGGER ================= //
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ================= ROTAS ================= //

// LISTAR PRODUTOS
app.get('/produtos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        id,
        nome,
        descricao,
        preco,
        imagem,
        categorias ( id, nome )
      `);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LISTAR CATEGORIAS
app.get('/categorias', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PRODUTOS POR CATEGORIA
app.get('/produtos/categoria/:nomeCategoria', async (req, res) => {
  try {
    const { nomeCategoria } = req.params;

    const { data, error } = await supabase
      .from('produtos')
      .select(`
        id,
        nome,
        descricao,
        preco,
        imagem,
        categorias!inner ( nome )
      `)
      .ilike('categorias.nome', `%${nomeCategoria}%`);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRIAR PRODUTO
app.post('/produtos', async (req, res) => {
  try {
    const { nome, preco, categoria_id, descricao, imagem } = req.body;

    if (!nome || preco == null || !categoria_id) {
      return res.status(400).json({
        error: "Nome, preço e categoria_id são obrigatórios."
      });
    }

    const { data, error } = await supabase
      .from('produtos')
      .insert([{ nome, preco, categoria_id, descricao, imagem }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ATUALIZAR PRODUTO
app.put('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, categoria_id, descricao, imagem } = req.body;

    const { data, error } = await supabase
      .from('produtos')
      .update({ nome, preco, categoria_id, descricao, imagem })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data.length) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETAR PRODUTO
app.delete('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data.length) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= 404 ================= //
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ================= EXPORT ================= //
// ESSA LINHA É O SEGREDO PRA VERCEL
export default serverless(app);

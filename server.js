require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ================= MIDDLEWARES ================= //
app.use(cors());
app.use(express.json());

// ================= SUPABASE ================= //
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ================= LOGGER ================= //
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// ================= ROTAS ================= //

// 1. LISTAR PRODUTOS (COM CATEGORIA)
app.get('/api/produtos', async (req, res) => {
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

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
});

// 2. LISTAR TODAS AS CATEGORIAS
app.get('/api/categorias', async (req, res) => {
    const { data, error } = await supabase
        .from('categorias')
        .select('*');

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
});

// 3. BUSCAR PRODUTOS POR CATEGORIA (NOME)
app.get('/api/produtos/categoria/:nomeCategoria', async (req, res) => {
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
        .ilike('categorias.nome', nomeCategoria);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
});

// 4. CRIAR PRODUTO
app.post('/api/produtos', async (req, res) => {
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

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data[0]);
});

// 5. ATUALIZAR PRODUTO
app.put('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, preco, categoria_id, descricao, imagem } = req.body;

    const { data, error } = await supabase
        .from('produtos')
        .update({ nome, preco, categoria_id, descricao, imagem })
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    if (!data.length) {
        return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.json(data[0]);
});

// 6. DELETAR PRODUTO (UUID CORRETO)
app.delete('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    if (!data.length) {
        return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.status(204).send();
});

// ================= ERROS ================= //

// 404
app.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada." });
});

// 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Erro interno do servidor." });
});

// ================= SERVIDOR ================= //
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

module.exports = app;



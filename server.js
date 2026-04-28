require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const router = express.Router();

// ================= VALIDAÇÃO ENV ================= //
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error("❌ ERRO: Variáveis do Supabase não definidas no .env");
    process.exit(1);
}

// ================= MIDDLEWARES ================= //
app.use(cors());
app.use(express.json());

// ================= LOGGER ================= //
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// ================= SUPABASE ================= //
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ================= ROTAS ================= //

// 1. LISTAR PRODUTOS
router.get('/produtos', async (req, res) => {
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

// 2. LISTAR CATEGORIAS
router.get('/categorias', async (req, res) => {
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

// 3. PRODUTOS POR CATEGORIA
router.get('/produtos/categoria/:nomeCategoria', async (req, res) => {
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

// 4. CRIAR PRODUTO
router.post('/produtos', async (req, res) => {
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

// 5. ATUALIZAR PRODUTO
router.put('/produtos/:id', async (req, res) => {
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

// 6. DELETAR PRODUTO
router.delete('/produtos/:id', async (req, res) => {
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

// ================= USAR PREFIXO /api ================= //
app.use('/api', router);

// ================= 404 ================= //
app.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada." });
});

// ================= 500 ================= //
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Erro interno do servidor." });
});

// ================= SERVIDOR ================= //
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;

const express = require('express');
const router = express.Router();
const db = require('../data/supabase'); // Ajustado para o caminho correto

// Listar produtos (com filtro opcional por categoriaId via Query String)
router.get('/', async (req, res) => {
    const { categoriaId } = req.query;

    try {
        let { data: produtos, error } = await db
            .from('produtos')
            .select('*');

        if (error) throw error;

        if (categoriaId) {
            produtos = produtos.filter(p => p.categoriaId === parseInt(categoriaId));
        }

        res.json(produtos);
    } catch (error) {
        next(error);
    }
});

// Buscar um único produto por ID
router.get('/:id', async (req, res, next) => {
    try {
        const { data: produto, error } = await db
            .from('produtos')
            .select('*')
            .eq('id', parseInt(req.params.id))
            .single();

        if (error) throw error;

        res.json(produto);
    } catch (error) {
        next(error);
    }   
});

// Adicionar novo produto
router.post('/', async (req, res, next) => {
    const { categoriaId, nome, descricao, preco, image } = req.body;

    try {
        const { data, error } = await db
            .from('produtos')
            .insert([{
                categoriaId: parseInt(categoriaId),
                nome,
                descricao,
                preco,
                image
            }])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    const produtoId = parseInt(req.params.id);
    const { nome, descricao, preco, image } = req.body;

    try {
        const { data, error } = await db
            .from('produtos')
            .update({
                nome,
                descricao,
                preco,
                image
            })
            .eq('id', produtoId)
            .select();

        if (error) throw error;

        res.json(data[0]);
    } catch (error) {
        next(error);
    }
});

        

// Remover produto
router.delete('/:id', async (req, res, next) => {
    const produtoId = parseInt(req.params.id);

    try {
        const { data, error } = await db
            .from('produtos')
            .delete()
            .eq('id', produtoId)
            .select();

        if (error) throw error;

        res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const supabase = require('../data/supabase'); // Importação padronizada do banco em memória

// Listar todas as categorias
router.get('/', async (req, res) => {
    try{
        const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('id', { ascending: true });
        if (error) {
        throw error;
        }
        res.json(data);
    }catch (error) {
        next(error);
    }

})

router.post('/', async (req, res) => {
    try{
        const { data, error } = await supabase
        .from('categorias')
        .insert([{ nome: req.body.nome }])
        .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    }catch (error) {
        next(error);
    }

})



// Criar nova categoria com ID incremental
module.exports = router;
const logger = (req, res, next) => {
    const horaAtual = new Date().toLocaleTimeString();
    console.log(`[${horaAtual}] Requisição recebida: ${req.method} ${req.url}`);
    next();
};

export default logger;
const getDiscountMatrix = async () => {
    console.log("🟦 [Excel Service] Obteniendo Matriz de Descuentos...");
    // Mock implementation
    return {
        standard_max: 20,
        aggressive_min: 21,
        no_discount: 0
    };
};

module.exports = {
    getDiscountMatrix
};

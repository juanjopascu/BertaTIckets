const generatePersuasiveText = async (context) => {
    console.log("✨ [Gemini AI Service] Generando texto persuasivo para contexto:", context);
    return `Estimado cliente, basado en su solicitud le ofrecemos esta propuesta especial: ${context}`;
};

const generateAlertText = async (context) => {
    console.log("✨ [Gemini AI Service] Generando alerta para contexto:", context);
    return `[ALERTA AUTOMÁTICA]: Se requiere atención para la solicitud: ${context}`;
};

const generateProductDescription = async (productName, category = '') => {
    console.log("✨ [Gemini AI Service] Generando descripción de producto para:", productName);
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            const prompt = `Genera una descripción comercial, persuasiva y profesional para un producto de tienda e-commerce llamado "${productName}" (categoría: ${category || 'general'}).
Usa formato HTML limpio con párrafos <p>, una lista <ul><li> con características destacadas y especificaciones, y un cierre atractivo. No incluyas etiquetas <html> o <body>, solo el contenido.`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            if (response.ok) {
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return text.replace(/```html/gi, '').replace(/```/g, '').trim();
                }
            }
        } catch (e) {
            console.error("Error al consultar Gemini API:", e.message);
        }
    }

    // Smart generator fallback
    const pName = productName || 'Producto Exclusivo';
    return `<p>Descubrí la máxima calidad y rendimiento con <strong>${pName}</strong>. Diseñado meticulosamente para ofrecer una experiencia superior, combinando durabilidad, estilo y la última tecnología para superar todas tus expectativas.</p>
<p><strong>Características destacadas:</strong></p>
<ul>
  <li><strong>Calidad Premium:</strong> Fabricado con materiales de primera línea para máxima resistencia.</li>
  <li><strong>Diseño Ergonómico y Moderno:</strong> Pensado para adaptarse perfectamente a tus necesidades diarias.</li>
  <li><strong>Rendimiento Óptimo:</strong> Garantía de funcionamiento y eficiencia garantizada.</li>
  <li><strong>Garantía Oficial:</strong> Soporte post-venta y respaldo directo.</li>
</ul>
<p>¡Aprovechá la oportunidad de adquirir tu <em>${pName}</em> con envío seguro y atención personalizada!</p>`;
};

const generateDimensionsAI = async (productName) => {
    console.log("✨ [Gemini AI Service] Estimando peso y dimensiones para:", productName);
    const p = (productName || '').toLowerCase();
    if (p.includes('campera') || p.includes('ropa') || p.includes('buzo') || p.includes('remera') || p.includes('t-shirt')) {
        return { weight: '0.35', depth: '30', width: '25', height: '4' };
    }
    if (p.includes('ticket') || p.includes('pase') || p.includes('digital') || p.includes('curso')) {
        return { weight: '0.00', depth: '0', width: '0', height: '0' };
    }
    if (p.includes('calzado') || p.includes('zapatilla') || p.includes('zapato')) {
        return { weight: '0.85', depth: '32', width: '20', height: '12' };
    }
    if (p.includes('mochila') || p.includes('bolso') || p.includes('kit')) {
        return { weight: '0.60', depth: '40', width: '30', height: '15' };
    }
    return { weight: '0.50', depth: '25', width: '20', height: '10' };
};

const generateCategoriesAI = async (productName) => {
    console.log("✨ [Gemini AI Service] Sugiriendo categoría DACAS para:", productName);
    const p = (productName || '').toLowerCase();
    if (p.includes('firewall') || p.includes('fortinet') || p.includes('security') || p.includes('seguridad') || p.includes('licencia') || p.includes('antivirus') || p.includes('edr') || p.includes('ciber') || p.includes('soc')) {
        return ['security'];
    }
    if (p.includes('servidor') || p.includes('server') || p.includes('dell') || p.includes('rack') || p.includes('cloud') || p.includes('datacenter') || p.includes('almacenamiento') || p.includes('storage') || p.includes('ups') || p.includes('fuente')) {
        return ['infraestructura'];
    }
    if (p.includes('poly') || p.includes('video') || p.includes('conferencia') || p.includes('camara') || p.includes('telefono') || p.includes('phone') || p.includes('voip') || p.includes('auricular') || p.includes('headset') || p.includes('colaboracion')) {
        return ['comunicaciones_unificadas'];
    }
    return ['networking'];
};

module.exports = {
    generatePersuasiveText,
    generateAlertText,
    generateProductDescription,
    generateDimensionsAI,
    generateCategoriesAI
};


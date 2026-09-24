const sendOutlookEmail = async (to, subject, body) => {
    console.log(`📧 [Outlook Service] Enviando correo a: ${to}`);
    console.log(`   Asunto: ${subject}`);
    console.log(`   Cuerpo: ${body.substring(0, 50)}...`);
    return true;
};

const sendTeamsMessage = async (channel, message) => {
    console.log(`💬 [Teams Service] Enviando alerta a canal: ${channel}`);
    console.log(`   Mensaje: ${message.substring(0, 50)}...`);
    return true;
};

module.exports = {
    sendOutlookEmail,
    sendTeamsMessage
};

/* =====================================================================
   CONFIGURAÇÃO DO SITE vh.compradeouro
   Edite este arquivo para mudar preços, contatos e a cotação reserva.
   Depois de salvar, publique de novo (ou faça o upload no Netlify).
   ===================================================================== */
window.VH_CONFIG = {
  // WhatsApp que recebe os agendamentos (55 + DDD + número, só dígitos)
  whatsapp: "5561984489331",

  // Preços de COMPRA da VH, em R$ por grama (usados no simulador)
  precosCompra: {
    "24": 520,
    "18": 390,
    "16": 320,
    "10": 110
  },
  precosAtualizadoEm: "18/11/2026",

  // Endereço da função que busca a cotação automática (não mude)
  apiCotacao: "api/cotacao.php",
  // De quanto em quanto tempo a página pede a cotação de novo (minutos)
  atualizarACadaMinutos: 5,

  // Cotação RESERVA: aparece só se a busca automática falhar.
  cotacaoReserva: {
    fonte: "ValorFinal / Cotação do Dia (mercado)",
    atualizadoEm: "19/11/2026 às 17:19",
    ouro:    { bid: 700.95, ask: 700.95 },
    prata:   { bid: 8.59,   ask: 8.59 },
    platina: { bid: 256.76, ask: 256.76 }
  }
};

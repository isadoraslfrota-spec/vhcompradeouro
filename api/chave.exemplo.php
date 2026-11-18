<?php
// ==========================================================
// MODELO. No servidor, copie este arquivo como  api/chave.php
// e cole a sua chave da GoldAPI entre as aspas abaixo.
// NUNCA envie o chave.php com a chave real para o GitHub.
// Este arquivo fica no servidor e NÃO aparece para os visitantes.
// ==========================================================
return [
  'GOLDAPI_KEY'   => 'COLE_SUA_CHAVE_AQUI',
  // De quanto em quanto tempo buscar a cotação de novo (minutos).
  // Plano gratuito da GoldAPI (150 consultas/mês): use 1440 (1x por dia).
  // Plano pago: 60 (de hora em hora) ou 15.
  'CACHE_MINUTOS' => 1440,
];

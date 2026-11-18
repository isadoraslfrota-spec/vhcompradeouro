<?php
// Busca a cotação de ouro, prata e platina em R$ por grama (GoldAPI) e guarda em cache.
// Para usar outro provedor (ex.: licença do Kitco), troque a função buscar_metal().
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');

// A chave fica em api/chave.php, criado direto no servidor (fora do Git).
// Use api/chave.exemplo.php como modelo.
$arqChave = __DIR__ . '/chave.php';
$cfg = is_file($arqChave) ? require $arqChave : ['GOLDAPI_KEY' => getenv('GOLDAPI_KEY') ?: '', 'CACHE_MINUTOS' => getenv('CACHE_MINUTOS') ?: 1440];
$chave = trim($cfg['GOLDAPI_KEY'] ?? '');
$minutos = max(1, (int)($cfg['CACHE_MINUTOS'] ?? 1440));
$arqCache = __DIR__ . '/cache/cotacao.json';
const ONCA = 31.1034768;

function responder($dados, $status = 200) {
  http_response_code($status);
  echo json_encode($dados, JSON_UNESCAPED_UNICODE);
  exit;
}

function buscar_metal($codigo, $chave) {
  $ch = curl_init("https://www.goldapi.io/api/price/$codigo/BRL");
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => ["x-access-token: $chave", 'Content-Type: application/json'],
  ]);
  $txt = curl_exec($ch);
  $cod = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($txt === false || $cod !== 200) throw new Exception("GoldAPI $codigo: HTTP $cod");
  $d = json_decode($txt, true);
  $preco = (float)($d['price'] ?? 0);
  $bid = (float)($d['bid'] ?? 0) ?: $preco;
  $ask = (float)($d['ask'] ?? 0) ?: $preco;
  if (!$bid || !$ask) throw new Exception("GoldAPI $codigo: resposta sem preço");
  return [
    'bid' => round($bid / ONCA, 2),
    'ask' => round($ask / ONCA, 2),
    'ts'  => (int)($d['timestamp'] ?? time()),
  ];
}

// 1) Cache ainda válido? devolve sem consultar o provedor.
$cache = is_file($arqCache) ? json_decode(@file_get_contents($arqCache), true) : null;
if ($cache && (time() - (int)($cache['_salvoEm'] ?? 0)) < $minutos * 60) {
  unset($cache['_salvoEm']);
  responder($cache);
}

if ($chave === '' || $chave === 'COLE_SUA_CHAVE_AQUI') {
  if ($cache) { unset($cache['_salvoEm']); responder($cache); }
  responder(['erro' => 'Chave da GoldAPI não configurada: crie api/chave.php a partir de api/chave.exemplo.php'], 503);
}

// 2) Busca nova cotação (com trava para não consultar duas vezes ao mesmo tempo).
$trava = fopen(__DIR__ . '/cache/.trava', 'c');
flock($trava, LOCK_EX);
try {
  $saida = ['fonte' => 'GoldAPI (spot)'];
  $ts = 0;
  foreach (['ouro' => 'XAU', 'prata' => 'XAG', 'platina' => 'XPT'] as $nome => $cod) {
    $m = buscar_metal($cod, $chave);
    $saida[$nome] = ['bid' => $m['bid'], 'ask' => $m['ask']];
    $ts = max($ts, $m['ts']);
  }
  $saida['atualizadoEm'] = gmdate('c', $ts);
  @file_put_contents($arqCache, json_encode($saida + ['_salvoEm' => time()], JSON_UNESCAPED_UNICODE), LOCK_EX);
  flock($trava, LOCK_UN);
  responder($saida);
} catch (Exception $e) {
  flock($trava, LOCK_UN);
  // Provedor falhou: devolve a última cotação boa, se houver.
  if ($cache) { unset($cache['_salvoEm']); responder($cache); }
  responder(['erro' => $e->getMessage()], 502);
}

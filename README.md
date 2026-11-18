# vh.compradeouro

Site da **vh.compradeouro**, especialistas na compra de ouro em Brasília/DF (Candangolândia e Núcleo Bandeirante).

- Simulador de valor do ouro (24k, 18k, 16k, 10k)
- Cotação automática de ouro, prata e platina em R$/g (GoldAPI)
- Agendamento de avaliação direto no WhatsApp
- Alianças em 3D interativas

## Estrutura

```
index.html            página
config.js             preços de compra, WhatsApp, cotação reserva  ← edite aqui
assets/style.css      visual
assets/app.js         simulador, WhatsApp, 3D, cotação
api/cotacao.php       busca a cotação (PHP, com cache)
api/chave.exemplo.php modelo do arquivo da chave
```

## Publicar na Hostinger via Git

1. hPanel → seu site → **Avançado → GIT**.
2. Repositório: `https://github.com/<usuario>/<repo>.git` · Branch: `main` · Diretório: deixe vazio (instala em `public_html`).
   - A pasta `public_html` precisa estar **vazia** antes da primeira instalação.
3. Clique em **Criar** e depois em **Implantar**.
4. Para atualizar automaticamente a cada push, ative **Implantação automática** e cole o webhook no GitHub
   (repositório → Settings → Webhooks → Add webhook).

### Chave da cotação (uma vez só, direto no servidor)

A chave **não** vai para o GitHub. No **Gerenciador de Arquivos** da Hostinger:

1. Em `public_html/api/`, copie `chave.exemplo.php` e renomeie a cópia para `chave.php`.
2. Edite `chave.php`, cole a chave da GoldAPI e salve.
3. `CACHE_MINUTOS`: `1440` (1x por dia, plano gratuito) ou `60` (de hora em hora, plano pago).

Teste em `https://seudominio/api/cotacao.php`.

## Atualizar preços

Edite `config.js` (`precosCompra`, `precosAtualizadoEm`), faça commit e push. Com a implantação automática ligada, o site atualiza sozinho.

> O preço do 16k (R$ 320) é provisório.

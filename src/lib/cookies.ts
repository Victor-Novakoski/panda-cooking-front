// Cookie que a API grava junto com o refresh token. Não é credencial (vale
// "1"): só diz ao servidor do front que existe sessão, para redirecionar
// antes de a página abrir e para o navegador saber se vale renovar o token.
// Quem confere a sessão de verdade é a API.
export const SESSION_COOKIE = "panda_session"

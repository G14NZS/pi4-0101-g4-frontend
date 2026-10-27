// Mensagens dos códigos de erro das fichas de contrato (CT1 a CT3).
// O Backend 1 já manda `mensagem`; estas só entram quando ela não vier.
export const MENSAGENS_DE_ERRO = {
  DADOS_INVALIDOS: 'Confira os dados preenchidos e tente de novo.',
  CREDENCIAIS_INVALIDAS: 'E-mail ou senha incorretos.',
  NAO_AUTENTICADO: 'Sua sessão expirou. Entre de novo para continuar.',
  SERVICO_DUPLICADO: 'Você já tem um serviço com esse nome.',
  PROFISSIONAL_NAO_ENCONTRADO: 'Não encontramos o seu perfil de profissional.',
  ERRO_DE_REDE: 'Não foi possível falar com o servidor.',
}

export const MENSAGEM_PADRAO = 'Algo deu errado. Tente de novo em instantes.'

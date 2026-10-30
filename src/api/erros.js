// Mensagens dos códigos de erro das fichas de contrato (CT1 a CT3, CT5 e CT7).
// O Backend 1 já manda `mensagem`; estas só entram quando ela não vier.
export const MENSAGENS_DE_ERRO = {
  DADOS_INVALIDOS: 'Confira os dados preenchidos e tente de novo.',
  CREDENCIAIS_INVALIDAS: 'E-mail ou senha incorretos.',
  NAO_AUTENTICADO: 'Sua sessão expirou. Entre de novo para continuar.',
  SERVICO_DUPLICADO: 'Você já tem um serviço com esse nome.',
  PROFISSIONAL_NAO_ENCONTRADO: 'Não encontramos o seu perfil de profissional.',
  SERVICO_NAO_ENCONTRADO: 'Esse serviço não está mais disponível.',
  DATA_INVALIDA: 'Escolha um dia de hoje em diante.',
  TELEFONE_INVALIDO: 'Informe um celular com DDD, por exemplo (19) 98888-7777.',
  NOME_OBRIGATORIO: 'Informe o seu nome.',
  HORARIO_INDISPONIVEL: 'Esse horário acabou de ser ocupado. Escolha outro.',
  ERRO_DE_REDE: 'Não foi possível falar com o servidor.',
}

export const MENSAGEM_PADRAO = 'Algo deu errado. Tente de novo em instantes.'

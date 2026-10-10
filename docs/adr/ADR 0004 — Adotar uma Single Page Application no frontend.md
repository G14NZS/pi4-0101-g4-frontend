## Status: aceito

##### Contexto:
O Reservice possui diferentes telas e fluxos, como cadastro, busca de prestadores, gerenciamento de serviços, agenda e realização de agendamentos. A aplicação precisa permitir navegação frequente entre essas funcionalidades sem exigir o recarregamento completo da página. Como o frontend já será desenvolvido com Vue.js, a equipe avaliou formas de estruturar a navegação e atualização da interface.

##### Decisão:
Adotar o modelo Single Page Application (SPA) no frontend do Reservice, utilizando navegação no lado do cliente entre as diferentes telas da aplicação.

##### Alternativas consideradas:

Aplicação multipágina tradicional: descartada porque cada navegação exigiria novas páginas e recarregamentos completos, aumentando a fragmentação da interface.

Renderização de páginas no servidor: descartada porque acrescentaria responsabilidades de apresentação ao lado servidor e não aproveitaria plenamente a arquitetura de componentes do frontend em Vue.

##### Consequências:

Positivas: navegação mais fluida entre telas; melhor reutilização de componentes; menor necessidade de recarregar páginas completas; separação mais clara entre interface e backend.

Negativas: aumenta a responsabilidade do frontend pelo controle de rotas e estado da interface; exige tratamento adequado de autenticação, navegação e carregamento de dados; falhas no JavaScript podem comprometer uma parte maior da experiência da aplicação.
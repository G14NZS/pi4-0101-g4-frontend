## Status: aceito

##### Contexto:
O Reservice precisa de uma interface web para cadastro de prestadores, gerenciamento de serviços e horários, busca de profissionais e realização de agendamentos. A equipe precisa de uma tecnologia que permita construir interfaces dinâmicas, organizar a aplicação em componentes reutilizáveis e integrar o front-end ao backend do sistema. O prazo do projeto e a curva de aprendizado da equipe também influenciam a escolha.

##### Decisão:
Adotar Vue.js como framework principal para o desenvolvimento do front-end do Reservice.

##### Alternativas consideradas:
- React: possui amplo ecossistema e grande adoção no mercado, mas foi descartado porque a equipe considera o Vue mais simples para o escopo atual e mais adequado à experiência disponível.
- Angular: oferece uma estrutura completa para aplicações web, porém foi descartado por apresentar maior complexidade e curva de aprendizado para o tamanho e o prazo do projeto.
- HTML, CSS e JavaScript sem framework: reduziria dependências externas, mas foi descartado porque exigiria maior esforço para organizar estados, componentes e atualização dinâmica da interface à medida que o sistema crescer.

##### Consequências:
- Positivas: facilita a construção de interfaces reativas; permite organizar a aplicação em componentes reutilizáveis; reduz código repetitivo na interface; possui curva de aprendizado compatível com o prazo e a experiência da equipe.
- Negativas: adiciona dependência de um framework e de seu ecossistema; exige conhecimento de sua estrutura e ferramentas; futuras mudanças para outro framework podem demandar reescrita significativa da camada de apresentação.
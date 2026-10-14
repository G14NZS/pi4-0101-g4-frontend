# Fluxo do E1: Cadastro de serviço

**Feito quando (da Entrega 1):** O profissional cadastra um serviço com nome, duração e preço, e ele aparece na lista de serviços oferecidos.

## Passos

1. O profissional abre o Frontend e entra com e-mail e senha.
2. O Frontend chama o Backend 1 com a operação abrirSessao (CT1). O Backend 1 lê o profissional na tabela profissional (CT14), confere a senha e devolve o token e o profissionalSlug.
3. O profissional abre "Meus serviços" e preenche nome, duração em minutos e preço de um serviço novo.
4. O Frontend chama o Backend 1 com a operação cadastrarServico (CT2), mandando o token.
5. O Backend 1 confere os dados e grava o serviço na tabela servico (CT15), ligado ao profissional do token.
6. O Backend 1 responde ao Frontend com o serviço criado.
7. O Frontend chama listarServicos (CT3) com o profissionalSlug. O Backend 1 lê as tabelas profissional (CT14) e servico (CT15) e devolve a lista.
8. A tela mostra a lista de serviços oferecidos, já com o serviço novo.

## Diagrama

```mermaid
sequenceDiagram
actor P as Profissional
participant F as Frontend
participant B as Backend 1
participant D as Banco
P->>F: entra com e-mail e senha
F->>B: CT1 abrirSessao
B->>D: CT14 profissional (lê)
D-->>B: profissional
B-->>F: token e profissionalSlug
P->>F: preenche nome, duração e preço
F->>B: CT2 cadastrarServico
B->>B: confere os dados
B->>D: CT15 servico (grava)
D-->>B: serviço gravado
B-->>F: serviço criado
F->>B: CT3 listarServicos
B->>D: CT14 profissional e CT15 servico (lê)
D-->>B: serviços do profissional
B-->>F: lista de serviços
F-->>P: lista com o serviço novo
```

**Contratos usados:** CT1 abrirSessao, CT2 cadastrarServico, CT3 listarServicos, CT14 profissional, CT15 servico.

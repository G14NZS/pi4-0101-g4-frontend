<script setup>
import AppBotao from '@/components/AppBotao.vue'
import AppIcone from '@/components/AppIcone.vue'
import PreviaAgendamento from '@/components/PreviaAgendamento.vue'
import SiteHeader from '@/components/SiteHeader.vue'

const passos = [
  {
    titulo: 'Monte sua agenda',
    texto:
      'Cadastre seus serviços com duração e preço e defina os dias e horários em que você atende.',
  },
  {
    titulo: 'Divulgue seu link',
    texto:
      'Mande o seu link pelo WhatsApp ou coloque no Instagram. O cliente vê só os horários livres.',
  },
  {
    titulo: 'Atenda sem esquecimentos',
    texto: 'O cliente recebe um SMS 3 horas antes, e você acompanha tudo na agenda do dia.',
  },
]
</script>

<template>
  <SiteHeader>
    <nav aria-label="Acesso" class="acesso">
      <AppBotao :to="{ name: 'entrar-cliente' }" variante="texto">Sou cliente</AppBotao>
      <AppBotao :to="{ name: 'entrar-profissional' }" variante="contorno">
        Entrar como profissional
      </AppBotao>
    </nav>
  </SiteHeader>

  <main>
    <section class="hero conteudo">
      <div class="hero__texto">
        <p class="sobretitulo">Para quem atende com hora marcada</p>
        <h1 class="hero__titulo">Seus clientes agendam sozinhos. Você só atende.</h1>
        <p class="hero__descricao">
          Cadastre seus serviços e horários, divulgue o seu link e receba agendamentos com
          lembrete automático por SMS 3 horas antes.
        </p>
        <div class="hero__acoes">
          <AppBotao :to="{ name: 'entrar-profissional' }" tamanho="g">
            Sou profissional, quero entrar
            <AppIcone nome="seta-direita" :tamanho="18" espessura="2.2" />
          </AppBotao>
          <AppBotao :to="{ name: 'entrar-cliente' }" variante="contorno" tamanho="g">
            Sou cliente
          </AppBotao>
        </div>
      </div>

      <div class="hero__previa">
        <PreviaAgendamento />
      </div>
    </section>

    <section class="como-funciona">
      <div class="como-funciona__interno conteudo">
        <h2 class="titulo-secao">Como funciona</h2>
        <ol class="passos">
          <li v-for="(passo, i) in passos" :key="passo.titulo" class="passo">
            <span class="passo__numero">{{ i + 1 }}</span>
            <h3 class="passo__titulo">{{ passo.titulo }}</h3>
            <p class="passo__texto">{{ passo.texto }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="conteudo chamada-cliente">
      <div class="chamada-cliente__caixa">
        <AppIcone nome="usuario" :tamanho="40" espessura="1.8" class="chamada-cliente__icone" />
        <div class="chamada-cliente__texto">
          <h2 class="chamada-cliente__titulo">É cliente?</h2>
          <p>
            Entre na sua conta para ver, cancelar ou remarcar seus agendamentos. Para marcar um
            horário novo, abra o link que o profissional te enviou.
          </p>
        </div>
        <div class="chamada-cliente__acoes">
          <AppBotao :to="{ name: 'entrar-cliente' }" variante="claro" tamanho="m">Entrar</AppBotao>
          <AppBotao
            :to="{ name: 'entrar-cliente', query: { aba: 'criar' } }"
            variante="contorno-claro"
            tamanho="m"
          >
            Criar conta
          </AppBotao>
        </div>
      </div>
    </section>
  </main>

  <footer class="rodape">
    <div class="rodape__interno conteudo">
      <span>Projeto Integrador IV · PUC-Campinas · Grupo 04</span>
      <span>2026</span>
    </div>
  </footer>
</template>

<style scoped>
.acesso {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* Hero */
.hero {
  padding-top: 48px;
  padding-bottom: 72px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 56px;
}

.hero__texto {
  flex: 1 1 460px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sobretitulo {
  margin: 0;
  font-weight: 600;
  color: var(--cor-destaque);
  font-size: 15px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hero__titulo {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.hero__descricao {
  margin: 0;
  font-size: 19px;
  color: var(--cor-texto-suave);
  max-width: 520px;
}

.hero__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.hero__previa {
  flex: 1 1 380px;
  min-width: 0;
  display: flex;
  justify-content: center;
}

/* Como funciona */
.como-funciona {
  background: var(--cor-superficie);
  padding: 72px 0;
}

.como-funciona__interno {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.titulo-secao {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 34px;
  letter-spacing: -0.01em;
}

.passos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
}

.passo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.passo__numero {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--cor-destaque-claro);
  color: var(--cor-destaque);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.passo__titulo {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.passo__texto {
  margin: 0;
  color: var(--cor-texto-suave);
}

/* Chamada para o cliente */
.chamada-cliente {
  padding-top: 72px;
  padding-bottom: 72px;
}

.chamada-cliente__caixa {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px 40px;
  padding: 36px 40px;
  background: var(--cor-texto);
  color: #fff;
  border-radius: 24px;
}

.chamada-cliente__icone {
  color: var(--cor-destaque-sobre-escuro);
}

.chamada-cliente__texto {
  flex: 1 1 420px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chamada-cliente__texto p {
  margin: 0;
  color: var(--cor-texto-sobre-escuro);
}

.chamada-cliente__titulo {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 26px;
}

.chamada-cliente__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Rodapé */
.rodape {
  border-top: 1px solid var(--cor-borda);
}

.rodape__interno {
  padding-top: 28px;
  padding-bottom: 28px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: var(--cor-texto-mudo);
}

@media (max-width: 600px) {
  .chamada-cliente__caixa {
    padding: 28px 24px;
  }
}
</style>

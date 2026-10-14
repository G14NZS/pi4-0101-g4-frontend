<script setup>
import AppIcone from './AppIcone.vue'

// Ilustração estática da tela de agendamento do cliente, usada na tela inicial.
const horarios = ['09:00', '09:30', '10:00', '14:00', '14:30', '15:00']
const horarioSelecionado = '14:00'
</script>

<template>
  <div class="previa" aria-hidden="true">
    <div class="previa__link">
      <AppIcone nome="link" :tamanho="16" />
      <span>reservice.com/p/ana-unhas</span>
    </div>

    <div>
      <div class="previa__nome">Ana Beatriz Costa</div>
      <div class="previa__subtitulo">Escolha o serviço e o horário</div>
    </div>

    <div class="previa__servico">
      <div>
        <div class="previa__servico-nome">Manicure simples</div>
        <div class="previa__subtitulo">45 min</div>
      </div>
      <div class="previa__servico-nome">R$ 35,00</div>
    </div>

    <div class="previa__dia">Terça, 20 de outubro</div>

    <div class="previa__horarios">
      <div
        v-for="horario in horarios"
        :key="horario"
        :class="['previa__horario', { 'previa__horario--selecionado': horario === horarioSelecionado }]"
      >
        {{ horario }}
      </div>
    </div>

    <div class="previa__confirmar">Confirmar agendamento</div>
  </div>
</template>

<style scoped>
.previa {
  width: 100%;
  max-width: 380px;
  background: var(--cor-superficie);
  border-radius: 24px;
  padding: 28px;
  box-shadow: var(--sombra-cartao);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.previa__link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--cor-fundo);
  border-radius: 10px;
  font-size: 14px;
  color: var(--cor-texto-suave);
}

.previa__nome {
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 20px;
}

.previa__subtitulo {
  font-size: 14px;
  color: var(--cor-texto-mudo);
}

.previa__servico {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 2px solid var(--cor-destaque);
  border-radius: 14px;
}

.previa__servico-nome {
  font-weight: 600;
}

.previa__dia {
  font-size: 14px;
  font-weight: 600;
  color: var(--cor-texto-suave);
}

.previa__horarios {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.previa__horario {
  text-align: center;
  padding: 10px 0;
  border: 1.5px solid var(--cor-borda);
  border-radius: 10px;
  font-size: 15px;
}

.previa__horario--selecionado {
  background: var(--cor-destaque);
  border-color: var(--cor-destaque);
  color: #fff;
  font-weight: 600;
}

.previa__confirmar {
  text-align: center;
  padding: 14px 0;
  background: var(--cor-texto);
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
}
</style>

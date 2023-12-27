<script lang="ts" setup>
import { useBankStore } from '@/stores/bank'
import { ref } from 'vue'
import { rollDice } from '@/utils'
import AnimateInteger from '@/components/AnimateInteger.vue';
const bankStore = useBankStore()
const name = ref<string>('')
function handleAddPlayer() {
  if (!name.value) return
  bankStore.addPlayer(name.value)
  name.value = ''
}
function handleStartGame() {
  if (bankStore.players.length === 0) return
  bankStore.startGame()
}

function handleRoll() {
  const diceA = rollDice()
  const diceB = rollDice()
  bankStore.roll = `${diceA} ${diceB}`
  if (bankStore.rollCount < 3) {
    if (diceA + diceB === 7) {
      bankStore.addBank(70)
    } else {
      bankStore.addBank(diceA + diceB)
    }
  } else {
    if (diceA + diceB === 7) {
      bankStore.endRound()
    } else if (diceA === diceB)  {
      bankStore.doubleBank()
    } else {
      bankStore.addBank(diceA + diceB)
    }
  }
  bankStore.nextPlayerTurn()
}

function handlePlayerBanked(index: number) {
  bankStore.playerBanked(index)
  if (bankStore.allPlayersBanked) bankStore.endRound()
}
</script>

<template>
  <v-container class="game">
    <v-row>
      <v-col cols="12" class="bankInfo">
        <v-icon icon="mdi-bank" size="large"></v-icon>
        <div>Bank Amount <AnimateInteger :value=bankStore.bank :speed=5 /></div>
      </v-col>
    </v-row>
    <v-list>
      <v-list-item 
      v-for="(player, index) in bankStore.players" 
      :key="player.name">
      <v-container>
        <v-row>
          <v-col>
            {{ player.name }}
          </v-col>
          <v-col>
            {{ player.score }}
          </v-col>
          <v-col>
            <v-btn 
            v-if="!player.banked && bankStore.canBank"
            @click="() => handlePlayerBanked(index)"
            >Bank</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-list-item>
  </v-list>
    <div>
      <div v-if="bankStore.state === 'setup'">
        Setup Actions
        <v-form v-on:submit="handleAddPlayer" @submit.prevent>
          <v-text-field v-model="name" label="Name"></v-text-field>
          <v-btn v-on:click="handleAddPlayer">Add Player</v-btn>
        </v-form>
        <v-btn v-on:click="handleStartGame">Start Game</v-btn>
      </div>
      <div v-else-if="bankStore.state === 'progress'">
        <v-container>
          <v-row>
            <v-col>Round {{ bankStore.round }}/{{ bankStore.maxRounds }} (Roll {{ bankStore.rollCount }})</v-col>
            <v-col>{{ bankStore.currentPlayer.name }} turn</v-col>
            <v-col>
              <v-btn v-on:click="handleRoll">Roll</v-btn>
            </v-col>
            <v-col>Roll {{ bankStore.roll }}</v-col>
          </v-row>
        </v-container>
      </div>
      <div v-else>ELSE {{ bankStore.state }}</div>
    </div>
  </v-container>
</template>

<style>
.bankInfo {
  text-align: center;
}
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>

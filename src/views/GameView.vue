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
function handleNewGame() {
  bankStore.newGame()
}

function handleRoll(diceA:number, diceB:number|undefined) {
  bankStore.roll = diceB ? [diceA, diceB] : []
  const total = diceB ? diceA + diceB : diceA
  const doubles = diceB ? diceA === diceB : diceA === -1
  if (bankStore.rollCount > 2) {
    if (total === 7) {
      bankStore.endRound()
    } else if (doubles)  {
      bankStore.doubleBank()
    } else {
      bankStore.addBank(total)
    }
  } else {
    if (total === 7) {
      bankStore.addBank(70)
    } else {
      bankStore.addBank(total)
    }
  }
  bankStore.nextPlayerTurn()
}


function handleRollClick() {
  const diceA = rollDice()
  const diceB = rollDice()
  handleRoll(diceA, diceB)
}

function handleManualRoll(amount: number) {
  handleRoll(amount, undefined)
}

function handlePlayerBanked(index: number) {
  bankStore.playerBanked(index)
  if (bankStore.allPlayersBanked) bankStore.endRound()
}

function toggleUseRealDice() {
  bankStore.useRealDice = !bankStore.useRealDice
  bankStore.roll = []
}
</script>

<template>
  <v-container class="game">
    <v-row>
      <v-col cols="6">
        <v-btn 
            v-if="bankStore.state !== 'setup'"
            @click="handleNewGame"
            >New Game</v-btn>
          <v-btn 
          v-if="bankStore.state === 'setup'"
          :disabled="bankStore.players.length === 0"
          v-on:click="handleStartGame">Start Game</v-btn>
      </v-col>
      <v-col cols="6">
        <v-switch 
        inset
        color="primary"
        v-model="bankStore.useRealDice"
        v-on:click="toggleUseRealDice"
        label="Use real dice"></v-switch>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="bankInfo">
          <img src="@/assets/bank-circle.svg" class="bankInfoIcon" />
          <div class="bankInfoAmount">
            <AnimateInteger :value=bankStore.bank :speed=5 />
          </div>
        </div>
      </v-col>
      <v-col v-if="bankStore.lastHistory">
        <v-card :text="bankStore.lastHistory"></v-card>
      </v-col>
    </v-row>
    <v-row>
        <v-col cols="12" v-if="bankStore.state === 'setup'">
          <v-form v-on:submit="handleAddPlayer" @submit.prevent>
            <v-container>
              <v-row>
                <v-col>
                  <v-text-field v-model="name" label="Name"></v-text-field>
                </v-col>
                <v-col cols="auto">
                  <v-btn 
                    :disabled="!name.length"
                    v-on:click="handleAddPlayer"
                  >Add Player</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-col>
        <v-col cols="12" v-else-if="bankStore.state === 'progress'">
          <v-container>
            <v-row>
              <v-col>{{ bankStore.currentPlayer.name }} turn</v-col>
              <v-col v-if="bankStore.useRealDice" cols="12">
                <v-container>
                  <v-row>
                    <v-col>
                      <v-btn 
                      :disabled="bankStore.isPastRollThree"
                      @click="() => handleManualRoll(2)">2</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn @click="() => handleManualRoll(3)">3</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn @click="() => handleManualRoll(4)">4</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn @click="() => handleManualRoll(5)">5</v-btn>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-btn @click="() => handleManualRoll(6)">6</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn 
                      :color="bankStore.isPastRollThree ? 'red' : 'primary'" 
                      @click="() => handleManualRoll(7)"
                      >7</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn @click="() => handleManualRoll(8)">8</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn @click="() => handleManualRoll(9)">9</v-btn>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-btn @click="() => handleManualRoll(10)">10</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn @click="() => handleManualRoll(11)">11</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn 
                      :disabled="bankStore.isPastRollThree"
                      @click="() => handleManualRoll(12)">12</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn 
                      color="yellow" 
                      :disabled="!bankStore.isPastRollThree"
                      @click="() => handleManualRoll(-1)">Doubles</v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
              <v-col v-if="!bankStore.useRealDice">
                <v-btn 
                prepend-icon="mdi-dice-multiple"
                v-on:click="handleRollClick">Roll</v-btn>
              </v-col>
              <v-col>
                <v-icon 
                v-for="number in bankStore.roll"
                v-bind:key="number"
                :icon="`mdi-dice-${number}`"
                size="x-large"
                >
                </v-icon>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        <v-col cols="12" v-else>ELSE {{ bankStore.state }}</v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-list>
          <v-list-item>
            Round {{ bankStore.round }}/{{ bankStore.maxRounds }} (Roll {{ bankStore.rollCount + 1 }})
          </v-list-item>
          <v-list-subheader>Players</v-list-subheader>
          <v-list-item 
          v-for="(player, index) in bankStore.rankedPlayers" 
          :key="player.name">
          <v-container>
            <v-row>
              <v-col>
                {{ player.name }}
              </v-col>
              <v-col>
                <AnimateInteger :value="player.score" :speed=10 />
              </v-col>
              <v-col>
                <v-btn 
                density="compact"
                prepend-icon="mdi-bank"
                v-if="bankStore.canBank"
                :disabled="player.banked"
                @click="() => handlePlayerBanked(index)"
                >Bank</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-list-item>
      </v-list>
      </v-col>
    </v-row>

  </v-container>
</template>

<style>
.bankInfo {
  text-align: center;
  position:relative;
  height: 92px;
  margin: 15px;
}
.bankInfoIcon {
  background-color: #333333;
  position:absolute;
  top: 0%;
  left: 50%;
  width: 92px;
  height: 92px;
  border-radius: 500px;
  transform: translateX(-50%);
}
.bankInfoAmount {
  font-family: monospace;
  color: white;
  font-size: 48px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
}
.game {
  max-width: 720px;
}
</style>

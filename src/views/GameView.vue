<script lang="ts" setup>
import { useBankStore } from '@/stores/bank'
import { ref } from 'vue'
import { rollDice } from '@/utils'
import AnimateInteger from '@/components/AnimateInteger.vue';
import { computed } from 'vue';
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

function handleRollClick() {
  console.log('handleRollClick')
  const diceA = rollDice()
  const diceB = rollDice()
  // handleRoll(diceA, diceB)
  bankStore.playerRolled([diceA, diceB])
}

function handleManualRoll(amount: number) {
  console.log('handleManualRoll')
  // handleRoll(amount, undefined)
  bankStore.playerRolled([amount])
}

function handlePlayerBanked(name: string) {
  if (!bankStore.canBank) return
  console.log('handlePlayerBanked')
  bankStore.playerBanked(name)
}

function toggleUseRealDice() {
  bankStore.useRealDice = !bankStore.useRealDice
  bankStore.roll = []
}

const playerColor = computed(() => {
  return bankStore.players.map((p) => {
    if (bankStore.state === 'end') return ''
    else if (p.banked) return 'primary'
    else if (p.name === bankStore.currentPlayer.name) return 'yellow'
    else return ''
  })
})
const displayPlayers = computed(() => (bankStore.state === 'end') ? bankStore.rankedPlayers : bankStore.players)
</script>

<template>
  <div class="game">
    <v-container>
      <v-row>
        <v-col align-self="center" cols="6">
          <v-btn 
            v-if="bankStore.state !== 'setup'"
            @click="handleNewGame"
            >{{bankStore.state === 'end' ? 'Play Again' : 'New Game'}}</v-btn>
          <v-btn 
            v-if="bankStore.state === 'setup'"
            :disabled="bankStore.players.length === 0"
            v-on:click="handleStartGame">Start Game</v-btn>
        </v-col>
        <v-col align-self="center" cols="6">
          <v-switch 
          inset
          color="primary"
          v-model="bankStore.useRealDice"
          v-on:click="toggleUseRealDice"
          label="Use real dice"></v-switch>
        </v-col>
      </v-row>
      <v-row v-if="bankStore.state === 'progress'">
        <v-col cols="4" align-self="center">
          <v-container>
            <v-row>
              <v-col>
                Round {{ bankStore.round + 1 }}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                Roll {{ bankStore.rollCount + 1 }}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                {{ bankStore.currentPlayer.name }}'s turn
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        <v-col cols="4" align-self="center">
          <div class="bankInfo">
            <img src="@/assets/bank-circle.svg" class="bankInfoIcon" />
            <div class="bankInfoAmount">
              <span :aria-label="`bank ${bankStore.bank}`" />
              <AnimateInteger :value=bankStore.bank :speed=5 />
            </div>
          </div>
        </v-col>
        <v-col cols="4" align-self="center" class="rollContainer">
          <v-container v-if="!bankStore.useRealDice">
            <v-row>
              <v-col>
                <v-btn 
                  prepend-icon="mdi-dice-multiple"
                  :aria-label="`${bankStore.currentPlayer.name} Roll`"
                  v-on:click="handleRollClick">Roll</v-btn>

              </v-col>
            </v-row>
            <v-row class="rollContainer">
              <v-col class="rollContainer">
                <v-icon 
                v-for="(number, index) in bankStore.roll"
                v-bind:key="index"
                :icon="`mdi-dice-${number}`"
                size="x-large"
                >
                </v-icon>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        <v-col cols="12">
          <v-card>
            <v-card-text aria-live="polite" aria-relevant="additions" role="alert">
              {{ bankStore.lastHistory }}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-if="bankStore.useRealDice" cols="12">
          <v-container>
              <v-row>
                <v-col cols="12">
                  <v-container>
                   <v-row>
                    <v-spacer></v-spacer>
                      <v-col>
                        <v-btn 
                        :disabled="bankStore.isPastRollThree"
                        aria-label="real dice roll 2"
                        @click="() => handleManualRoll(2)">2</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn aria-label="real dice roll 3" @click="() => handleManualRoll(3)">3</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn aria-label="real dice roll 4" @click="() => handleManualRoll(4)">4</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn aria-label="real dice roll 5" @click="() => handleManualRoll(5)">5</v-btn>
                      </v-col>
                      <v-spacer></v-spacer>
                    </v-row>
                    <v-row>
                      <v-spacer></v-spacer>
                      <v-col>
                        <v-btn aria-label="real dice roll 6" @click="() => handleManualRoll(6)">6</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn 
                        :color="bankStore.isPastRollThree ? 'red' : 'primary'" 
                        aria-label="real dice roll 7" @click="() => handleManualRoll(7)"
                        >7</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn aria-label="real dice roll 8" @click="() => handleManualRoll(8)">8</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn aria-label="real dice roll 9" @click="() => handleManualRoll(9)">9</v-btn>
                      </v-col>
                      <v-spacer></v-spacer>
                      </v-row>
                    <v-row>
                      <v-spacer></v-spacer>
                      <v-col>
                        <v-btn aria-label="real dice roll 10" @click="() => handleManualRoll(10)">10</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn aria-label="real dice roll 11" @click="() => handleManualRoll(11)">11</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn 
                        :disabled="bankStore.isPastRollThree"
                        aria-label="real dice roll 12" @click="() => handleManualRoll(12)">12</v-btn>
                      </v-col>
                      <v-col>
                        <v-btn 
                        color="yellow" 
                        :disabled="!bankStore.isPastRollThree"
                        aria-label="real dice roll doubles" @click="() => handleManualRoll(-1)">Doubles</v-btn>
                      </v-col>
                      <v-spacer></v-spacer>
                    </v-row>
                  </v-container>
                </v-col>
              </v-row>
            </v-container>
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
          <v-col cols="12" v-else-if="bankStore.state === 'end'" class="end" aria-live="polite" aria-relevant="additions" role="alert">
            <v-icon icon="mdi-trophy" size="x-large" /><br />
            THE WINNER IS <br />
            {{ bankStore.winner }}
          </v-col>
      </v-row>
      <v-row
      v-for="(player, index) in displayPlayers" 
      :disabled="player.banked"
      :aria-label="`${player.name} score ${player.score}`"
      :key="player.name"
      >
      <v-col
        cols="12"
        >
          <v-sheet
            rounded
            :color="playerColor[index]"
          >
            <v-container>
              <v-row>
                <v-col aria-hidden="true">{{ player.name }}</v-col>
                <v-col aria-hidden="true">{{ player.score }}</v-col>
                  <v-col aria-label="">
                    <v-btn 
                      density="compact"
                      prepend-icon="mdi-bank"
                      v-if="bankStore.canBank"
                      :disabled="player.banked"
                      :aria-label="`${player.name} bank`"
                      @click="() => handlePlayerBanked(player.name)"
                      >Bank</v-btn>
                  </v-col>
              </v-row>
            </v-container>
          </v-sheet>

        </v-col>
      </v-row>
    </v-container>
  </div>
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
  font-size: 4em;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
}
.rollContainer {
  text-align: right;
}
.game {
  max-width: 600px;
  margin:0px auto;
}
.end {
  text-align: center;
  font-size: 2em;
}
</style>

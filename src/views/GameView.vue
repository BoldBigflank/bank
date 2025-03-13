<script lang="ts" setup>
import { useBankStore } from '@/stores/bank'
import { ref } from 'vue'
import { rollDice } from '@/utils'
import AnimateInteger from '@/components/AnimateInteger.vue';
import { computed } from 'vue';
const bankStore = useBankStore()
const name = ref<string>('')
const drawer = ref<boolean>(false)
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
  if (bankStore.state !== 'setup') {
    const confirmed = confirm('Are you sure you want to start a new game?')
    if (!confirmed) return
  }
  bankStore.newGame()
  drawer.value = false
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
    else if (p.banked) return 'success'
    else if (p.name === bankStore.currentPlayer.name) return 'accent'
    else return 'primary'
  })
})
const displayPlayers = computed(() => (bankStore.state === 'end') ? bankStore.rankedPlayers : bankStore.players)
</script>

<template>
  <div class="game-view">
    <v-layout class="layout">
      <v-navigation-drawer
        v-model="drawer"
        temporary
        class="drawer"
        location="right"
      >
        <v-list-item
          prepend-icon="mdi-close"
          title="Close"
          value="close"
          @click="drawer = false"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <v-list-item
          prepend-icon="mdi-one-up"
          title="New Game"
          value="newGame"
          @click="handleNewGame"
            
          ></v-list-item>
          <v-list-item
          :prepend-icon="bankStore.useRealDice ? 'mdi-dice-multiple' : 'mdi-monitor'"
          :title="bankStore.useRealDice ? 'Use virtual dice' : 'Use real dice'"
          value="realDice"
          @click="toggleUseRealDice"
          ></v-list-item>
          <v-divider></v-divider>  
          <v-list-item prepend-icon="mdi-information" title="About" value="about" @click="$router.push('/about')"></v-list-item>
          
        </v-list>
      </v-navigation-drawer>
      <div class="game font-weight-bold">
        <v-container>
          <v-row dense>
            <v-col align-self="center" cols="6">
              <v-btn 
                v-if="bankStore.state === 'setup'"
                color="primary"
                :disabled="bankStore.players.length === 0"
                v-on:click="handleStartGame">Start Game</v-btn>
            </v-col>
            <v-col align="right" cols="6">
              <v-btn 
                v-if="bankStore.state === 'setup'"
                color="primary"
                prepend-icon="mdi-information"
                aria-label="About"
                size="default"
                @click="$router.push('/about')">About</v-btn>
            </v-col>
          </v-row>
          <v-row dense v-if="bankStore.state === 'progress'">
            <v-col cols="4" align-self="center">
              <v-container>
                <v-row>
                  <v-col class="text-primary">
                    Round {{ bankStore.round + 1 }}
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="text-primary">
                    Roll {{ bankStore.rollCount + 1 }}
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="text-primary">
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
              <v-row v-if="!bankStore.useRealDice" class="rollContainer">
                  <v-col class="rollContainer" style="text-align: center;">
                    <v-icon 
                    v-for="(number, index) in bankStore.roll"
                    class="text-white"
                    v-bind:key="index"
                    :icon="`mdi-dice-${number}`"
                    size="50"
                    >
                    </v-icon>
                  </v-col>
                </v-row>
            </v-col>
            <v-col cols="4" align-self="center" class="rollContainer">
              <v-container>
                <v-row>
                  <v-col>
                    <v-btn 
                      prepend-icon="mdi-menu-open"
                      color="primary"
                      @click.stop="drawer = !drawer"
                      aria-label="Menu"
                      size="default"
                    >Menu</v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="!bankStore.useRealDice">
                  <v-col>
                    <v-btn 
                      prepend-icon="mdi-dice-multiple"
                      :aria-label="`${bankStore.currentPlayer.name} Roll`"
                      color="primary"
                      v-on:click="handleRollClick"
                      size="default"
                    >Roll</v-btn>
                  </v-col>
                </v-row>
                
              </v-container>
            </v-col>
            <v-col cols="12">
              <v-card color="info">
                <v-card-text aria-live="polite" role="alert" aria-atomic="false" aria-relevant="additions">
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
                            color="secondary" 
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
          <v-row dense>
              <v-col cols="12" v-if="bankStore.state === 'setup'">
                <v-form v-on:submit="handleAddPlayer" @submit.prevent>
                  <v-container>
                    <v-row>
                      <v-col>
                        <v-text-field class="text-primary" v-model="name" label="Name"></v-text-field>
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
              <v-col cols="12" v-else-if="bankStore.state === 'end'" class="end" aria-live="polite" role="alert">
                <v-icon icon="mdi-trophy" size="x-large" /><br />
                THE WINNER IS <br />
                {{ bankStore.winner }}<br />
                <v-btn 
                @click="handleNewGame"
                >Play Again</v-btn>
              </v-col>
          </v-row>
          <v-row
          v-for="(player, index) in displayPlayers" 
          :disabled="player.banked"
          :aria-label="`${player.name} score ${player.score}`"
          :key="player.name"
          no-gutters
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
                    <v-col class="font-weight-medium" aria-hidden="true">{{ player.name }}</v-col>
                    <v-col aria-hidden="true">{{ player.score }}</v-col>
                      <v-col aria-label="">
                        <v-btn 
                          density="compact"
                          color="secondary"
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
    </v-layout>
    
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
  background-color: #808080;
  color: yellow;
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
  margin: 0 auto;
  flex: 1;
  width: 100%;
  position: relative;
}
.end {
  text-align: center;
  font-size: 2em;
}
.layout {
  min-height: 100vh;
  width: 100%;
}

.drawer {
  height: 100vh;
}

.game-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.menu-fab {
  position: fixed;
  top: 16px;
  right: 0;
  z-index: 9999;
  margin: 0;
  padding: 0;
  transform: none;
  opacity: 0.8;
  will-change: transform;
  backface-visibility: hidden;
  border-radius: 4px 0 0 4px;
}
</style>

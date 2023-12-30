import { defineStore } from 'pinia'

type Player = {
  name: string
  score: number
  banked: boolean
}
type History = {
  name: string
  action: string
}
type State = 'setup' | 'progress' | 'end'
type BankStateType = {
  players: Player[]
  state: State
  turn: number
  roll: string
  rollCount: number
  bank: number
  round: number,
  maxRounds: number,
  history: History[]
}
export const useBankStore = defineStore('bank', {
  state: () => ({
    players: [],
    state: 'setup',
    turn: 0,
    roll: '',
    rollCount: 0,
    bank: 0,
    round: 0,
    maxRounds: 10,
    history: []
  } as BankStateType),
  getters: {
    currentPlayer(state) {
      const p = state.players[state.turn]
      if (!p) return {name: ''}
      return p
    },
    allPlayersBanked(state) {
      return state.players.every(p => p.banked)
    },
    canBank(state) {
      return state.rollCount > 2 && state.state === 'progress'
    }
  },
  actions: {
    newGame() {
      this.players = []
      this.state = 'setup'
      this.turn = 0
      this.roll = ''
      this.rollCount = 0
      this.bank = 0
      this.round = 0
      this.maxRounds = 10
      this.history = []
    },
    addPlayer(name: string) {
      this.players.push({
        name,
        score: 0,
        banked: false
      })
    },
    startGame() {
      this.state = 'progress'
      this.round = 0
    },
    bankPlayer(index: number) {
      this.players[index].banked = true
    },
    nextPlayerTurn() {
      this.turn = (this.turn + 1) % this.players.length
      while (this.players[this.turn].banked) {
        this.turn = (this.turn + 1) % this.players.length
      }
      this.rollCount += 1
    },
    addBank(amount: number) {
      this.bank += amount
      this.addHistory(`added ${amount} to the bank`)
    },
    doubleBank() {
      this.bank *= 2
      this.addHistory(`doubled the bank`)
    },
    playerBanked(index: number) {
      this.players[index].score += this.bank
      this.players[index].banked = true
      this.addHistory(`${this.players[index].name} banked`)
    },
    endRound() {
      this.players = this.players.map((p) => ({
        ...p,
        banked: false
      }))
      this.bank = 0
      this.round += 1
      this.rollCount = 0
      if (this.round === this.maxRounds) {
        this.state = 'end'
      }
      this.addHistory(`ended the round`)
    },
    addHistory(action: string) {
      this.history.push({
        name: this.currentPlayer.name,
        action
      })
    }
  },
  persist: true
})

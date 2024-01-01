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
  roll: number[]
  rollCount: number
  bank: number
  round: number,
  maxRounds: number,
  useRealDice: boolean,
  history: History[]
}
export const useBankStore = defineStore('bank', {
  state: () => ({
    players: [],
    state: 'setup',
    turn: 0,
    roll: [],
    rollCount: 0,
    bank: 0,
    round: 0,
    maxRounds: 10,
    useRealDice: false,
    history: []
  } as BankStateType),
  getters: {
    currentPlayer(state) {
      const p = state.players[state.turn]
      if (!p) return {name: ''}
      return p
    },
    rankedPlayers(state) {
      return [...state.players].sort((a, b) => a.score < b.score ? 1 : -1)
    },
    winner(state) {
      const rankedPlayers = [...state.players].sort((a, b) => a.score < b.score ? 1 : -1)
      return rankedPlayers
      .filter((p) => p.score === rankedPlayers[0].score)
      .map((p) => p.name)
      .join(' and ')
    },
    lastHistory(state) {
      if (state.history.length === 0) return ""
      const {name, action} = state.history[state.history.length - 1]
      return `${name} ${action}`
    },
    allPlayersBanked(state) {
      return state.players.every(p => p.banked)
    },
    canBank(state) {
      return state.rollCount > 2 && state.state === 'progress'
    },
    isPastRollThree(state) {
      return state.rollCount > 2
    }
  },
  actions: {
    newGame() {
      if (this.state === 'end') {
        // Same Players game
        this.players = this.players.map((p) => ({
          ...p,
          banked: false,
          score: 0
        }))
        this.state = 'progress'
      } else {
        this.players = []
        this.state = 'setup'
      }
      this.turn = 0
      this.roll = []
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
    nextPlayerTurn() {
      if (this.allPlayersBanked) {
        this.endRound()
        return
      }
      this.turn = (this.turn + 1) % this.players.length
      while (this.players[this.turn].banked) {
        this.turn = (this.turn + 1) % this.players.length
      }
    },
    addBank(amount: number) {
      this.bank += amount
      this.addHistory(`added ${amount} to the bank`)
      this.rollCount += 1
    },
    doubleBank() {
      this.bank *= 2
      this.addHistory(`doubled the bank`)
      this.rollCount += 1
    },
    playerBanked(name: string) {
      this.players = this.players.map((p) => ({
        ...p,
        banked: p.banked || p.name === name,
        score: (p.name === name) ? p.score + this.bank : p.score
      }))
      this.addHistory(`${name} banked`)
      if (name === this.currentPlayer.name) {
        this.nextPlayerTurn()
      }
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

import { arraySum } from "@/utils";
import { defineStore } from "pinia";

type Player = {
    name: string;
    score: number;
    banked: boolean;
};
type State = "setup" | "progress" | "end";
type BankStateType = {
    players: Player[];
    state: State;
    turn: number;
    roll: number[];
    rollCount: number;
    bank: number;
    round: number;
    maxRounds: number;
    useRealDice: boolean;
    history: string[];
};
export const useBankStore = defineStore("bank", {
    state: () =>
        ({
            players: [],
            state: "setup",
            turn: 0,
            roll: [],
            rollCount: 0,
            bank: 0,
            round: 0,
            maxRounds: 10,
            useRealDice: false,
            history: [],
        }) as BankStateType,
    getters: {
        currentPlayer(state) {
            const p = state.players[state.turn];
            if (!p) return { name: "" };
            return p;
        },
        rankedPlayers(state) {
            return [...state.players].sort((a, b) =>
                a.score < b.score ? 1 : -1,
            );
        },
        winner(state) {
            const rankedPlayers = [...state.players].sort((a, b) =>
                a.score < b.score ? 1 : -1,
            );
            return rankedPlayers
                .filter((p) => p.score === rankedPlayers[0].score)
                .map((p) => p.name)
                .join(" and ");
        },
        lastHistory(state) {
            if (state.history.length === 0) return "start";
            return state.history[state.history.length - 1];
        },
        allPlayersBanked(state) {
            return state.players.every((p) => p.banked);
        },
        canBank(state) {
            return state.rollCount > 2 && state.state === "progress";
        },
        isPastRollThree(state) {
            return state.rollCount > 2;
        },
    },
    actions: {
        newGame() {
            if (this.state === "end") {
                // Same Players game
                this.players = this.players.map((p) => ({
                    ...p,
                    banked: false,
                    score: 0,
                }));
                this.state = "progress";
            } else {
                this.players = [];
                this.state = "setup";
            }
            this.turn = 0;
            this.roll = [];
            this.rollCount = 0;
            this.bank = 0;
            this.round = 0;
            this.maxRounds = 10;
            this.history = [];
            this.history.push(`Begin by entering all player names.`);
        },
        addPlayer(name: string) {
            this.players.push({
                name,
                score: 0,
                banked: false,
            });
        },
        startGame() {
            this.state = "progress";
            this.round = 0;
            this.history.push(`Round ${this.round + 1}`);
        },
        nextPlayerTurn() {
            if (this.allPlayersBanked) {
                this.history.push(
                    `All players banked and ended round ${this.round + 1}.`,
                );
                this.endRound();
                return;
            }
            this.turn = (this.turn + 1) % this.players.length;
            while (this.players[this.turn].banked) {
                this.turn = (this.turn + 1) % this.players.length;
            }
        },
        playerRolled(dice: number[]) {
            this.roll = dice;
            const total = dice.reduce((a, c) => a + c, 0);
            const isDoubles =
                dice.length > 1 ? dice[0] === dice[1] : dice[0] === -1;
            if (this.rollCount > 2) {
                if (total === 7) {
                    this.history.push(
                        `${
                            this.currentPlayer.name
                        } rolled a 7 and ended round ${
                            this.round + 1
                        } at bank amount ${this.bank}`,
                    );
                    this.endRound();
                } else if (isDoubles) {
                    this.bank *= 2;
                    this.history.push(
                        `${this.currentPlayer.name} rolled doubles and the bank is now ${this.bank}.`,
                    );
                    this.rollCount += 1;
                } else {
                    this.bank += total;
                    this.history.push(
                        `Roll ${this.rollCount + 1}, ${
                            this.currentPlayer.name
                        } added ${total} to the bank for a total of ${
                            this.bank
                        }.`,
                    );
                    this.rollCount += 1;
                }
            } else {
                if (total === 7) {
                    this.bank += total;
                    this.history.push(
                        `Roll ${this.rollCount + 1}, ${
                            this.currentPlayer.name
                        } rolled 7 and added ${total} to the bank for a total of ${
                            this.bank
                        }.`,
                    );
                    this.rollCount += 1;
                } else {
                    this.bank += total;
                    this.history.push(
                        `Roll ${this.rollCount + 1}, ${
                            this.currentPlayer.name
                        } added ${total} to the bank for a total of ${
                            this.bank
                        }.`,
                    );
                    this.rollCount += 1;
                }
            }
            this.nextPlayerTurn();
        },
        playerBanked(name: string) {
            const p = this.players.find((p) => p.name === name);
            if (!p) return;
            if (p.banked) return;
            p.banked = true;
            p.score += this.bank;
            this.history.push(
                `${name} banked ${this.bank} and now has a score of ${p.score}.`,
            );
            if (name === this.currentPlayer.name) {
                this.nextPlayerTurn();
            }
        },
        endRound() {
            this.players = this.players.map((p) => ({
                ...p,
                banked: false,
            }));
            this.bank = 0;
            this.round += 1;
            this.rollCount = 0;
            if (this.round === this.maxRounds) {
                this.state = "end";
            }
        },
    },
    persist: true,
});

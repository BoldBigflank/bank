export const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1
}

export const arraySum = (i: number[]): number => {
    let sum = 0
    i.forEach(n => sum += n)
    return sum
}
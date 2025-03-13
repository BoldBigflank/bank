<template>
  <div class="about text-primary">
    <h1>Developed by Alex Swan</h1>
    <p>
      View the source on <a href="https://github.com/BoldBigflank/bank/" target="_blank">GitHub</a>
    </p>
    <v-container>
      <v-row>
        <v-col>
          <v-list>
            <v-list-item>
              Players take turns rolling a die (or clicking Roll) to add value to the bank. 
            </v-list-item>
            <v-list-item>
              A player may choose to "Bank" at any point, even when it's not their turn. This adds the current value of the bank to their score.
            </v-list-item>
            <v-list-item>
              If a player rolls 7, the round ends. No one else will be allowed to bank, and the bank returns to 0. This rule does not apply to the first 3 rolls of a round. Instead, rolling a 7 during the first 3 rolls adds 70 to the bank.
            </v-list-item>
            <v-list-item>
              When a player rolls doubles, the value of the bank is doubled. This rule does not apply to the first 3 rolls of a round. Instead, the value of the sum of the dice is added to the bank as usual.
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
    <v-btn @click="$router.push('/game')">Back to Game</v-btn>
  </div>
</template>

<style>

.about {
  max-width: 600px;
  margin:0px auto;
}
</style>

import * as readline from "readline";

interface PlayerState {
  balance: number;
  inventory: {
    personal_information: number
  }
}

const state: PlayerState = {
  balance: 0,
  inventory: {
    personal_information: 0,
  }
}

const rline = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `H$ ${state.balance}  ~  `
})

console.log("welcome to termploit, a silly lil terminal game :P")
console.log("commands: 'hack toaster', 'sell personal_information', 'exit'\n");

rline.prompt();

rline.on("line", (line) => {
  const input = line.trim().toLowerCase();
  switch (input) {
    case "hack toaster":
      state.inventory.personal_information += 1;
      console.log("you have successfully hacked and bypassed a toaster's firewall. Gains: [Personal Information] x1\n");
      break;
    case "sell personal_information":
      if (state.inventory.personal_information > 0) {
        const price = Math.floor(Math.random() * 2) + 1;
        state.balance += price;
        state.inventory.personal_information -= 1;
        console.log(`you sold [Personal information] x1 for H$ ${price}.\n`);
      } else {
        console.log("you don't have any personal data to sell you silly cat meow\n");
      }
      break;
    case "exit":
      console.log("disconnecting from termploit...\n");
      process.exit(0);
    default:
      console.log("unknown termploit command!!!!!!!!!!!!!!!!!!!! uh oh\n");
      break;
  }
  rline.setPrompt(`H$ ${state.balance}  ~  `);
  rline.prompt();
});
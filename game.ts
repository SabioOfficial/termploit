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
});

let busy = false;

function progressBar(
  label: string,
  duration: number, // in milliseconds
  width = 20
): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const filled = Math.floor(progress * width);
      const empty = width - filled;

      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${label} [${"█".repeat(filled)}${" ".repeat(empty)}] ${Math.floor(progress * 100)}%`);
      if (progress >= 1) {
        clearInterval(interval);
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        resolve();
      }
    }, 100);
  });
}

console.log("welcome to termploit, a silly lil terminal game :P")
console.log("commands: 'hack toaster', 'sell personal_information', 'exit'\n");

rline.prompt();

rline.on("line", async (line) => {
  if (busy) {
    console.log("hold on! there's a pending operation already in progress!!!!!");
    rline.prompt();
    return;
  }

  const input = line.trim().toLowerCase();
  switch (input) {
    case "hack toaster":
      busy = true;
      await progressBar("hacking toaster", 4000);
      state.inventory.personal_information += 1;
      console.log("you have successfully hacked and bypassed a toaster's firewall. Gains: [Personal Information] x1\n");
      busy = false;
      break;
    case "sell personal_information":
      if (state.inventory.personal_information > 0) {
        busy = true;
        const price = Math.floor(Math.random() * 2) + 1;
        await progressBar("selling data", (Math.floor(Math.random() * 5) + 1) * 1000);
        state.balance += price;
        state.inventory.personal_information -= 1;
        console.log(`you sold [Personal information] x1 for H$ ${price}.\n`);
        busy = false;
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
import * as readline from "readline";

interface PlayerState {
  balance: number;
  level: number;
  hpp: number;
  hackPower: number;
  inventory: {
    personal_information: number
  }
}

const state: PlayerState = {
  balance: 0,
  level: 1,
  hpp: 0,
  hackPower: 1,
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

function hppRequired(level: number): number {
  return 5 * Math.pow(2, level - 1);
}

async function checkLevelUp() {
  let requiredHpp = hppRequired(state.level);
  while (state.hpp >= requiredHpp) {
    const oldLevel = state.level;
    state.hpp -= requiredHpp;
    state.level += 1;
    state.hackPower = state.level;
    await showLevelUp(oldLevel, state.level);
    requiredHpp = hppRequired(state.level);
  }
  renderStatus();
}

async function showLevelUp(oldLevel: number, newLevel: number) {
  for (let i = 0; i < 8; i++) {
    console.clear();
    if (i % 2 === 0) {
      console.log("\n\n");
      console.log("01001000 01001001 01001000 01001001\n");
      console.log(`        >>> LEVEL UP <<<`);
      console.log(`             ${oldLevel} > ${newLevel}\n`);
      console.log("01001000 01001001 01001000 01001001");
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  console.clear();
  console.log(`>>> LEVEL UP! ${oldLevel} > ${newLevel} <<<`);
  console.log("\npress any key to continue...");
  await waitForAnyKey();
}

function renderStatus() {
  console.clear();
  console.log("welcome to termploit, a silly lil terminal game :P\n");
  console.log(`
commands:
  > hack
    Hack a machine. Gives Items and Hack Performance Points (HPP).

    > toaster
      Hack a toaster. Gives x1 [Personal Information] and 1 HPP. Takes 4 Hack Power (HP).

    > fridge
      Hack a fridge. Gives x10 [Personal Information] and 10 HPP. Takes 24 Hack Power (HP).

  > sell
    Sell an item from your inventory. Gives Hack Bucks (H$).

    > personal_information
      Sell personal information to companies. Gives H$1-2 per [Personal Information].

  > exit
    Exit the game.
  \n`);
  console.log(`
flags:
  > -a
    Sells all of the item. Used on command "sell".
  `);
  console.log(`LVL ${state.level}  ~  ${state.hpp}/${hppRequired(state.level)} HPP`);
  console.log(`HP ${state.hackPower}  ~  ${state.hackPower} HP/s\n`)
}

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

function waitForAnyKey(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      resolve();
    });
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hackTimeCalc(hackDifficulty: number): number {
  const seconds = Math.ceil(hackDifficulty / state.hackPower);
  return seconds * 1000;
}

renderStatus();
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
      await progressBar("hacking toaster", hackTimeCalc(4));
      state.inventory.personal_information += 1;
      state.hpp += 1;
      console.log("you have successfully hacked and bypassed a toaster's firewall. Gains: [Personal Information] x1\n");
      await checkLevelUp();
      busy = false;
      break;
    case "hack fridge":
      busy = true;
      await progressBar("hacking fridge", hackTimeCalc(24));
      state.inventory.personal_information += 10;
      state.hpp += 10;
      console.log("you have successfully hacked and bypassed a smart fridge's firewall. Gains: [Personal Information] x10\n");
      await checkLevelUp();
      busy = false;
      break;
    case "sell personal_information":
    case "sell personal_information -a": {
      if (state.inventory.personal_information <= 0) {
        console.log("you don't have any personal data to sell you silly cat meow\n");
        break;
      }
      busy = true;
      const sellAll = input.endsWith("-a"); // this will do for now
      const amount = sellAll ? state.inventory.personal_information : 1;
      // config start :D
      const baseTime = 500;
      const perItemTime = 300;
      // config stop :(
      await progressBar("selling data", clamp(baseTime + perItemTime * amount, 1000, 6000));
      let totalPrice = 0;
      for (let i = 0; i < amount; i++) totalPrice += Math.floor(Math.random() * 2) + 1;
      state.balance += totalPrice;
      state.inventory.personal_information -= amount;
      console.log(`you sold x${amount} [Personal Information] for H$ ${totalPrice}.\n`);
      busy = false;
      break;
    }
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
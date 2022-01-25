const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const { Keypair } = require('@solana/web3.js');

const {getWalletBalance,transferSOL,airDropSol}=require("./solana");
const { getReturnAmount, totalAmtToBePaid, randomNumber } = require('./helper');

const init = () => {
    console.log(
        chalk.green(
        figlet.textSync("SOL Stake", {
            font: "Standard",
            horizontalLayout: "default",
            verticalLayout: "default"
        })
        )
    );
    console.log(chalk.yellow`The max bidding amount is 2.5 SOL here, and you need to pay 5% of investment as fee!`);
};

//Ask for Ratio
//Ask for Sol to be Staked
//Check the amount to be available in Wallet 
//Ask Public Key
//Generate a Random Number
//Ask for the generated Number 
//If true return the SOL as per ratio

const userSecretKey=[
    191, 142, 168,  23, 211, 153, 150,  84, 205,  96,  32,
    84, 203, 221,  80, 225,  86, 146, 164,  23, 202, 184,
    221, 121,   7,  64, 148,  83, 120, 204,  10,  77,  27,
    220, 183, 243, 122, 204, 186, 146, 207, 167, 106,  42,
    143,  52, 226,  19, 112, 238, 138, 108, 114, 178, 109,
    197,  27,   5, 160,  54,  29,  34, 230,  36
]

const userWallet=Keypair.fromSecretKey(Uint8Array.from(userSecretKey));


//Treasury
const secretKey=[
    218, 187, 198, 110,  39,  18, 214, 234,   2, 114, 209,
    177,  62, 210, 184, 163,   9, 210, 171,  74, 228, 133,
    155, 173, 248, 224,  77, 161, 149,  66, 160,  29, 110,
    174, 103,  69, 204,  45,  74,  38, 188,  56, 152,  52,
    214,  50, 166, 124,  60, 234, 133, 232, 199,  67, 246,
    213,  71, 173,  42, 121, 250, 185, 109, 191
]

const treasuryWallet=Keypair.fromSecretKey(Uint8Array.from(secretKey));


const askQuestions = () => {
    const questions = [
        {
            name: "SOL",
            type: "number",
            message: "What is the amount of SOL you want to stake?",
        },
        {
            type: "rawlist",
            name: "RATIO",
            message: "What is the ratio of your staking?",
            choices: ["1:1.25", "1:1.5", "1.75", "1:2"],
            filter: function(val) {
                const stakeFactor=val.split(":")[1];
                return stakeFactor;
            },
        },
        {
            type:"number",
            name:"RANDOM",
            message:"Guess a random number from 1 to 5 (both 1, 5 included)",
            when:async (val)=>{
                if(parseFloat(totalAmtToBePaid(val.SOL))>5){
                    console.log(chalk.red`You have violated the max stake limit. Stake with smaller amount.`)
                    return false;
                }else{
                    // console.log("In when")
                    console.log(`You need to pay ${chalk.green`${totalAmtToBePaid(val.SOL)}`} to move forward`)
                    const userBalance=await getWalletBalance(userWallet.publicKey.toString())
                    if(userBalance<totalAmtToBePaid(val.SOL)){
                        console.log(chalk.red`You don't have enough balance in your wallet`);
                        return false;
                    }else{
                        console.log(chalk.green`You will get ${getReturnAmount(val.SOL,parseFloat(val.RATIO))} if guessing the number correctly`)
                        return true;    
                    }
                }
            },
        }
    ];
    return inquirer.prompt(questions);
};


const gameExecution=async ()=>{
    init();
    const generateRandomNumber=randomNumber(1,5);
    // console.log("Generated number",generateRandomNumber);
    const answers=await askQuestions();
    if(answers.RANDOM){
        const paymentSignature=await transferSOL(userWallet,treasuryWallet,totalAmtToBePaid(answers.SOL))
        console.log(`Signature of payment for playing the game`,chalk.green`${paymentSignature}`);
        if(answers.RANDOM===generateRandomNumber){
            //AirDrop Winning Amount
            await airDropSol(treasuryWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)));
            //guess is successfull
            const prizeSignature=await transferSOL(treasuryWallet,userWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)))
            console.log(chalk.green`Your guess is absolutely correct`);
            console.log(`Here is the price signature `,chalk.green`${prizeSignature}`);
        }else{
            //better luck next time
            console.log(chalk.yellowBright`Better luck next time`)
        }
    }
}

gameExecution()
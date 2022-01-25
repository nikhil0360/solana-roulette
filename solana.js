const web3 = require("@solana/web3.js");

const transferSOL=async (from,to,transferAmt)=>{
    try{
        const connection=new web3.Connection(web3.clusterApiUrl("devnet"),"confirmed");
        const transaction=new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey:new web3.PublicKey(from.publicKey.toString()),
                toPubkey:new web3.PublicKey(to.publicKey.toString()),
                lamports:transferAmt*web3.LAMPORTS_PER_SOL
            })
        )
        const signature=await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        )
        return signature;
    }catch(err){
        console.log(err);
    }
};

const getWalletBalance=async (pubk)=>{
    try{
        const connection=new web3.Connection(web3.clusterApiUrl("devnet"),"confirmed");
        const balance=await connection.getBalance(new web3.PublicKey(pubk));
        return balance/web3.LAMPORTS_PER_SOL;
    }catch(err){
        console.log(err);
    }
};

const airDropSol = async () => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const walletKeyPair = await Keypair.fromSecretKey(secretKey);
        console.log(`-- Airdropping 2 SOL --`)
        const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(walletKeyPair.publicKey),
        2 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(fromAirDropSignature);
    } catch (err) {
        console.log(err);
    }
};

module.exports={
    getWalletBalance,
    transferSOL,
    airDropSol
}
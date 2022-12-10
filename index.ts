import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, transfer } from "@solana/spl-token";

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), "confirmed");
    const fromWallet = Keypair.generate();
    console.log('fromWallet public key', fromWallet.publicKey.toBase58());
    console.log('Requesting airdrop');
    const fromAirdropSignature = await connection.requestAirdrop(
        fromWallet.publicKey,
        LAMPORTS_PER_SOL
    );
    console.log('Confirming signature for airdrop')
    await connection.confirmTransaction(fromAirdropSignature);
    console.log('Creating mint');
    const mint = await createMint(
        connection,
        fromWallet,
        fromWallet.publicKey,
        null,
        0
    );
    console.log('Mint (Token)', mint.toBase58());
    console.log('Creating fromTokenAccount');
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );
    console.log('fromTokenAccount address', fromTokenAccount.address.toBase58());
    console.log('Creating toTokenAccount');
    const toWallet = Keypair.generate();
    console.log('toWallet public key', toWallet.publicKey.toBase58());
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        toWallet.publicKey
    );
    console.log('toTokenAccount address', toTokenAccount.address.toBase58());
    console.log('Minting token');
    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        fromWallet.publicKey,
        1
    );
    console.log('Setting the minting authority');
    await setAuthority(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey,
        0,
        null
    );
    console.log('Transferring the token')
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        1
    );
    console.log("SIGNATURE", signature);
})();
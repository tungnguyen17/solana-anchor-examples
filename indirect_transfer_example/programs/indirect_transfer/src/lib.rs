use anchor_lang::prelude::*;
use anchor_lang::solana_program;

#[program]
mod indirect_transfer {
  use super::*;

  pub fn transfer_sol(
    ctx: Context<TransferSolContext>,
    amount: u64,
  ) -> ProgramResult {
    msg!("Instruction: Transfer SOL");
    let payer = &ctx.accounts.payer;
    let sender = &ctx.accounts.sender;
    let recipient = &ctx.accounts.recipient;
    let system_program = &ctx.accounts.system_program;
    let instruction = &solana_program::system_instruction::transfer(sender.key, recipient.key, amount);
    msg!("DEBUG: Transfer Instruction {:?}", instruction);
    msg!("DEBUG: Sender {:?}", &sender);
    msg!("DEBUG: Recipient {:?}", &recipient);
    solana_program::program::invoke(&instruction, &[payer.clone(), sender.clone(), recipient.clone()]);
    Ok(())
  }

  pub fn transfer_token(
    ctx: Context<TransferTokenContext>,
    amount: u64,
  ) -> ProgramResult {
    msg!("Instruction: Transfer Token");
    Ok(())
  }
}

#[derive(Accounts)]
pub struct TransferSolContext<'info> {
  #[account(signer)]
  pub payer: AccountInfo<'info>,
  #[account(signer)]
  pub sender: AccountInfo<'info>,
  #[account(mut)]
  pub recipient: AccountInfo<'info>,
  pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TransferTokenContext<'info> {
  #[account(signer)]
  pub sender: AccountInfo<'info>,
  pub token_mint: AccountInfo<'info>,
  pub sender_token: AccountInfo<'info>,
  pub recipient_token: AccountInfo<'info>,
  pub token_program: AccountInfo<'info>,
}

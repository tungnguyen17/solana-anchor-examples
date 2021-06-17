use anchor_lang::prelude::{
  AccountDeserialize,
  AccountInfo,
  AccountMeta,
  AccountSerialize,
  Accounts,
  AccountsExit,
  AnchorDeserialize,
  AnchorSerialize,
  borsh,
  Context,
  msg,
  program,
  ProgramError,
  ProgramResult,
  Pubkey,
  ToAccountInfo,
};
use anchor_lang::solana_program::{
  system_instruction,
};
use anchor_lang::solana_program::program::{
  invoke,
  invoke_signed,
};

#[program]
mod indirect_transfer {
  use super::*;

  pub fn transfer_sol(
    ctx: Context<TransferSolContext>,
    amount: u64,
  ) -> ProgramResult {
    msg!("Instruction: Transfer SOL");
    let sender = &mut ctx.accounts.sender;
    let recipient = &mut ctx.accounts.recipient;
    let system_program = &mut ctx.accounts.system_program;
    let instruction = &system_instruction::transfer(sender.key, recipient.key, amount);
    let accounts = &[sender.clone(), recipient.clone(), system_program.clone()];
    invoke(&instruction, &accounts[0..3]);
    Ok(())
  }
}

#[derive(Accounts)]
pub struct TransferSolContext<'info> {
  #[account(signer)]
  pub sender: AccountInfo<'info>,
  pub recipient: AccountInfo<'info>,
  pub system_program: AccountInfo<'info>,
}

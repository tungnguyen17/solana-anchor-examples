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
mod cross_program_invocation {
  use super::*;

  pub fn primary(
    ctx: Context<PrimaryContext>,
    amount: u64,
  ) -> ProgramResult {
    msg!("Instruction: Primary");
    Ok(())
  }
}

#[derive(Accounts)]
pub struct PrimaryConext<'info> {
}

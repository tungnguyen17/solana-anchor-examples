use anchor_lang::prelude::*;
use anchor_lang::solana_program;

#[program]
mod cross_program_invocation {
  use super::*;

  pub fn empty(
    _ctx: Context<EmptyContext>,
  ) -> ProgramResult {
    msg!("Instruction: Empty");
    Ok(())
  }

  pub fn direct(
    ctx: Context<DirectContext>,
  ) -> ProgramResult {
    msg!("Instruction: Direct");
    Ok(())
  }

  pub fn direct_signed(
    ctx: Context<DirectSignedContext>,
  ) -> ProgramResult {
    msg!("Instruction: Direct Signed");
    Ok(())
  }

  pub fn indirect(
    ctx: Context<IndirectContext>,
    destinaton: Pubkey,
    data: Vec<u8>,
  ) -> ProgramResult {
    msg!("Instruction: Indirect");
    let sender = &ctx.accounts.sender;
    let recipient = &ctx.accounts.recipient;
    let instruction = solana_program::instruction::Instruction {
      program_id: destinaton,
      data: data.clone(),
      accounts: vec![],
    };
    let accounts = ctx.remaining_accounts;
    solana_program::program::invoke(&instruction, &accounts);
    Ok(())
  }

  pub fn indirect_signed(
    ctx: Context<IndirectSignedContext>,
  ) -> ProgramResult {
    msg!("Instruction: Indirect Signed");
    let sender = &ctx.accounts.sender;
    Ok(())
  }
}

#[derive(Accounts)]
pub struct EmptyContext {
}

#[derive(Accounts)]
pub struct DirectContext<'info> {
  pub sender: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct DirectSignedContext<'info> {
  #[account(signer)]
  pub sender: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct IndirectContext<'info> {
  pub sender: AccountInfo<'info>,
  pub recipient: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct IndirectSignedContext<'info> {
  #[account(signer)]
  pub sender: AccountInfo<'info>,
}

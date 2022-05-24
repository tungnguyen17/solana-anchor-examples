use anchor_lang::prelude::*;
use anchor_lang::solana_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod cross_program_invocation {
  use super::*;

  pub fn empty(
    _ctx: Context<EmptyContext>,
  ) -> Result<()> {
    msg!("Instruction: Empty");

    Ok(())
  }

  pub fn direct(
    _ctx: Context<DirectContext>,
  ) -> Result<()> {
    msg!("Instruction: Direct");

    Ok(())
  }

  pub fn direct_signed(
    _ctx: Context<DirectSignedContext>,
  ) -> Result<()> {
    msg!("Instruction: Direct Signed");

    Ok(())
  }

  pub fn indirect(
    ctx: Context<IndirectContext>,
    destinaton: Pubkey,
    data: Vec<u8>,
  ) -> Result<()> {
    msg!("Instruction: Indirect");

    let sender = &ctx.accounts.sender;
    let recipient = &ctx.accounts.recipient;
    let instruction = solana_program::instruction::Instruction {
      program_id: destinaton,
      data: data.clone(),
      accounts: vec![
        solana_program::instruction::AccountMeta {
          pubkey: *sender.key,
          is_signer: false,
          is_writable: false,
        }
      ],
    };
    solana_program::program::invoke(&instruction, &[sender.clone(), recipient.clone()])
      .expect("CPI failed");

    Ok(())
  }

  pub fn indirect_signed(
    ctx: Context<IndirectSignedContext>,
    destinaton: Pubkey,
    data: Vec<u8>,
  ) -> Result<()> {
    msg!("Instruction: Indirect Signed");

    let sender = &ctx.accounts.sender;
    let recipient = &ctx.accounts.recipient;
    let instruction = solana_program::instruction::Instruction {
      program_id: destinaton,
      data: data.clone(),
      accounts: vec![
        solana_program::instruction::AccountMeta {
          pubkey: *sender.key,
          is_signer: true,
          is_writable: false,
        }
      ],
    };
    solana_program::program::invoke(&instruction, &[sender.clone(), recipient.clone()])
      .expect("CPI failed");

    Ok(())
  }
}

#[derive(Accounts)]
pub struct EmptyContext {
}

#[derive(Accounts)]
pub struct DirectContext<'info> {

  /// CHECK: Any account
  pub sender: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct DirectSignedContext<'info> {

  /// CHECK: Any account
  #[account(signer)]
  pub sender: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct IndirectContext<'info> {

  /// CHECK: Account to forward in CPI call
  pub sender: AccountInfo<'info>,

  /// CHECK: Account to forward in CPI call
  pub recipient: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct IndirectSignedContext<'info> {

  /// CHECK: Signer to forward in CPI call
  #[account(signer)]
  pub sender: AccountInfo<'info>,

  /// CHECK: Account to forward in CPI call
  pub recipient: AccountInfo<'info>,
}

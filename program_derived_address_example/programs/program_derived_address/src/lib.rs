use anchor_lang::prelude::*;
use anchor_lang::solana_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod program_derived_address {
  use super::*;

  pub fn empty(
    _ctx: Context<EmptyContext>,
  ) -> Result<()> {
    msg!("Instruction: Empty");

    Ok(())
  }

  pub fn forward(
    ctx: Context<ForwardContext>,
    accs: Vec<TransactionAccount>,
    data: Vec<u8>,
    seed: Vec<u8>,
    nonce: u8,
  ) -> Result<()> {
    msg!("Instruction: Forward");

    let destination = &ctx.accounts.destination;
    let instruction = solana_program::instruction::Instruction {
      program_id: *destination.key,
      accounts: accs.into_iter().map(Into::into).collect(),
      data: data.clone(),
    };
    let remaining_accounts = ctx.remaining_accounts;
    let seeds: &[&[_]] = &[&seed.clone(), &[nonce]];
    solana_program::program::invoke_signed(&instruction, &remaining_accounts, &[&seeds])
      .expect("Cross Program Invocation failed");

    Ok(())
  }
}

#[derive(Accounts)]
pub struct EmptyContext {
}

#[derive(Accounts)]
pub struct ForwardContext<'info> {
  /// CHECK: target program to forward the instruction to
  pub destination: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TransactionAccount {
  pubkey: Pubkey,
  is_signer: bool,
  is_writable: bool,
}

impl From<TransactionAccount> for AccountMeta {
  fn from(account: TransactionAccount)
  -> AccountMeta {
    match account.is_writable {
      false => AccountMeta::new_readonly(account.pubkey, account.is_signer),
      true => AccountMeta::new(account.pubkey, account.is_signer),
    }
  }
}

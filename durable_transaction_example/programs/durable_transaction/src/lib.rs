use anchor_lang::prelude::*;

declare_id!("BF9NFCCtkETvj44iWzTQLKA2DSYr7h34hgdDJGEmnX6t");

#[program]
mod durable_transaction {
  use super::*;

  pub fn create_counter(
    _ctx: Context<CreateCounterContext>,
    _derivation_path: Vec<u8>,
  ) -> Result<()> {

    Ok(())
  }

  pub fn invoke(
    ctx: Context<InvokeContext>,
  ) -> Result<()> {

    let accounts = ctx.remaining_accounts;
    let mut signer_count: u8 = 0;
    for i in 0..accounts.len() {
      let acc = &accounts[i];
      if acc.is_signer {
        signer_count += 1;
      }
    }

    let counter = &mut ctx.accounts.counter;
    counter.signer_count = signer_count;
    msg!("Total signer: {:?}", signer_count);

    Ok(())
  }

  pub fn invoke_unique(
    ctx: Context<InvokeContext>,
  ) -> Result<()> {

    let accounts = ctx.remaining_accounts;
    let mut signer_count: u8 = 0;
    let mut last_signer: Pubkey = Pubkey::default();
    for i in 0..accounts.len() {
      let acc = &accounts[i];
      let is_ordered = last_signer < acc.key();
      if acc.is_signer && is_ordered {
        last_signer = acc.key();
        signer_count += 1;
      }
    }

    let counter = &mut ctx.accounts.counter;
    counter.signer_count = signer_count;
    msg!("Total signer: {:?}", signer_count);

    Ok(())
  }
}

#[derive(Accounts)]
#[instruction(derivation_path: Vec<u8>)]
pub struct CreateCounterContext<'info> {

  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
    init,
    seeds = [
      &derivation_path
    ],
    bump,
    space = 32,
    payer = payer,
  )]
  pub counter: Account<'info, Counter>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InvokeContext<'info> {

  pub sender: Signer<'info>,

  #[account(mut)]
  pub counter: Account<'info, Counter>,
}

#[account]
pub struct Counter {
  pub signer_count: u8,
}

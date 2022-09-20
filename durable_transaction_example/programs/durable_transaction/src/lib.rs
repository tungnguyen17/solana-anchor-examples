use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod durable_transaction {
  use super::*;

  pub fn invoke(
    ctx: Context<InvokeContext>,
  ) -> Result<()> {

    let accounts = ctx.remaining_accounts;
    let mut signer_count = 0;
    for i in 0..accounts.len() - 1 {
      let acc = &accounts[i];
      if acc.is_signer {
        signer_count += 1;
      }
    }

    msg!("Total signer: {:?}", signer_count);

    Ok(())
  }
}

#[derive(Accounts)]
pub struct InvokeContext<'info> {

  /// CHECK:: Placeholder for sender account
  pub sender: AccountInfo<'info>,
}

use anchor_lang::prelude::*;

pub mod anchor_spl;
pub mod spl_token;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod program_derived_address {
  use super::*;

  pub fn readme(
    ctx: Context<ReadmeContext>,
  ) -> Result<()> {
    msg!("Instruction: Readme");

    let mint = &ctx.accounts.mint;
    let token = &ctx.accounts.token;

    msg!("Token Account: {:?}", token.key());
    msg!("Owner        : {:?}", token.owner);
    msg!("Mint         : {:?}", token.mint);
    msg!("Amount       : {:?}", token.amount);
    msg!("Decimals     : {:?}", mint.decimals);
    msg!("Supply       : {:?}", mint.supply);

    Ok(())
  }
}

#[derive(Accounts)]
pub struct ReadmeContext<'info> {

  pub token: Account<'info, anchor_spl::TokenAccount>,

  #[account(
    constraint = token.mint == mint.key() @ErrorCode::InvalidAccount,
  )]
  pub mint: Account<'info, anchor_spl::TokenMint>,
}

#[error_code]
pub enum ErrorCode {
  #[msg("Invalid Account.")]
  InvalidAccount,
}

pub mod spl_ed25519;

use anchor_lang::prelude::*;
use spl_ed25519::{
  create_message_verification_instruction,
  SignatureTuple,
  verify_message_signatures,
};

declare_id!("ed25yCKPyfYZh6moATb2K6MJhnkbsiiFzi2sCPKeNuC");

#[program]
mod ed25519_verification {
  use super::*;

  pub fn create_counter(
    _ctx: Context<CreateCounterContext>,
    _derivation_path: Vec<u8>,
  ) -> Result<()> {

    Ok(())
  }

  pub fn compare_message_signature(
    _ctx: Context<CompareMessageSignatureContext>,
    message: Vec<u8>,
    signatures: Vec<SignatureTuple>,
    instruction_data: Vec<u8>,
  ) -> Result<()> {

    let instruction_data_to_compare = create_message_verification_instruction(
      &message,
      &signatures,
    );

    msg!("{:?}", &instruction_data);
    msg!("{:?}", &instruction_data_to_compare);
    require!(instruction_data == instruction_data_to_compare, ErrorCode::InvalidInput);

    Ok(())
  }

  pub fn validate_message_signature(
    ctx: Context<ValidateMessageSignatureContext>,
    message: Vec<u8>,
    signatures: Vec<SignatureTuple>,
  ) -> Result<()> {

    let sysvar_instructions = &ctx.accounts.instructions;

    let is_valid = verify_message_signatures(
      &message,
      &signatures,
      &sysvar_instructions,
      0,
    );

    require!(is_valid, ErrorCode::InvalidInput);

    let counter = &mut ctx.accounts.counter;
    let signer_count = signatures.len() as u8;
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
pub struct CompareMessageSignatureContext {
}

#[derive(Accounts)]
pub struct ValidateMessageSignatureContext<'info> {

  #[account(mut)]
  pub counter: Account<'info, Counter>,

  /// CHECK: Solana native Instructions SysVar
  pub instructions: AccountInfo<'info>,
}

#[account]
pub struct Counter {
  pub signer_count: u8,
}


#[error_code]
pub enum ErrorCode {

  #[msg("Invalid input")]
  InvalidInput,
}

pub mod ed25519;

use anchor_lang::prelude::*;
use ed25519::{
  create_message_verification_instruction,
  SignatureTuple,
};

declare_id!("ed25yCKPyfYZh6moATb2K6MJhnkbsiiFzi2sCPKeNuC");

#[program]
mod ed25519_verification {
  use super::*;

  pub fn validate_message_signature(
    _ctx: Context<ValidateMessageSignatureContext>,
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
}

#[derive(Accounts)]
pub struct ValidateMessageSignatureContext {
}

#[error_code]
pub enum ErrorCode {

  #[msg("Invalid input")]
  InvalidInput,
}

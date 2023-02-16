use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {

  #[msg("Invalid Account.")]
  InvalidAccount,
}

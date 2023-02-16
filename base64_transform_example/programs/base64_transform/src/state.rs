use anchor_lang::prelude::*;

#[account]
pub struct MessageInfo {
  pub sender: Pubkey,
  pub timestamp: i64,
}

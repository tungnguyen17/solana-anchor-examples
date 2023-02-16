mod context;
mod error;
mod state;

use anchor_lang::prelude::*;
use base64::prelude::*;
use crate::{
  context::*,
  state::*,
};

declare_id!("b64kZKyW4VzaRRsKecKxhJfPzxcjrx4M3rK3wq8ZuFw");

#[program]
mod cross_program_invocation {
  use super::*;

  pub fn decode(
    _ctx: Context<DecodeContext>,
    message_base64_buffer: Vec<u8>,
  ) -> Result<()> {
    let message_buffer = BASE64_STANDARD.decode(message_base64_buffer).unwrap();
    let message = MessageInfo::try_from_slice(&message_buffer).unwrap();

    msg!("Sender: {:?}", message.sender);

    Ok(())
  }

  pub fn encode(
    _ctx: Context<EncodeContext>,
    sender: Pubkey,
    timestamp: i64,
  ) -> Result<()> {

    let message = MessageInfo {
      sender,
      timestamp,
    };
    let message_buffer = message.try_to_vec().unwrap();
    let message_base64 = BASE64_STANDARD.encode(message_buffer);

    msg!("Message: {:?}", message_base64);
    msg!("Message: {:?}", message_base64.as_bytes());

    Ok(())
  }
}

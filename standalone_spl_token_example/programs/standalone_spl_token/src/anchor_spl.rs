use anchor_lang::{
  prelude::{
    Pubkey,
  },
};
use solana_program::{
  program_pack::{
    Pack,
  },
};
use std::{
  ops::{
    Deref,
  },
};
use crate::spl_token;

#[derive(Clone)]
pub struct TokenMint(spl_token::TokenMint);

impl TokenMint {
  pub const LEN: usize = spl_token::TokenMint::LEN;
}

impl anchor_lang::AccountDeserialize for TokenMint {
  fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
    spl_token::TokenMint::unpack(buf)
      .map(TokenMint)
      .map_err(Into::into)
  }
}

impl anchor_lang::AccountSerialize for TokenMint {}

impl anchor_lang::Owner for TokenMint {
  fn owner() -> Pubkey {
    spl_token::ID
  }
}

impl Deref for TokenMint {
  type Target = spl_token::TokenMint;

  fn deref(&self) -> &Self::Target {
    &self.0
  }
}

#[derive(Clone)]
pub struct TokenAccount(spl_token::TokenAccount);

impl TokenAccount {
  pub const LEN: usize = spl_token::TokenAccount::LEN;
}

impl anchor_lang::AccountDeserialize for TokenAccount {
  fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
    spl_token::TokenAccount::unpack(buf)
      .map(TokenAccount)
      .map_err(Into::into)
  }
}

impl anchor_lang::AccountSerialize for TokenAccount {}

impl anchor_lang::Owner for TokenAccount {
  fn owner() -> Pubkey {
    spl_token::ID
  }
}

impl Deref for TokenAccount {
  type Target = spl_token::TokenAccount;

  fn deref(&self) -> &Self::Target {
      &self.0
  }
}

use anchor_lang::prelude::*;
use anchor_lang::solana_program;

#[program]
mod indirect_transfer {
  use super::*;

  pub fn transfer_sol(
    ctx: Context<TransferSolContext>,
    amount: u64,
  ) -> ProgramResult {
    msg!("Instruction: Transfer SOL");
    let payer = &ctx.accounts.payer;
    let sender = &ctx.accounts.sender;
    let recipient = &ctx.accounts.recipient;
    let system_program = &ctx.accounts.system_program;
    let instruction = &solana_program::system_instruction::transfer(sender.key, recipient.key, amount);
    msg!("DEBUG: Transfer Instruction {:?}", instruction);
    solana_program::program::invoke(&instruction, &[payer.clone(), sender.clone(), recipient.clone()]);
    Ok(())
  }

  pub fn transfer_token(
    ctx: Context<TransferTokenContext>,
    amount: Vec<u8>,
  ) -> ProgramResult {
    msg!("Instruction: Transfer Token");
    let token_program = &ctx.accounts.token_program;
    let payer = &ctx.accounts.payer;
    let sender = &ctx.accounts.sender;
    let sender_token = &ctx.accounts.sender_token;
    let recipient_token = &ctx.accounts.recipient_token;
    let instruction = solana_program::instruction::Instruction {
      program_id: *token_program.key,
      accounts: vec![
        solana_program::instruction::AccountMeta::new(*sender_token.key, false),
        solana_program::instruction::AccountMeta::new(*recipient_token.key, false),
        solana_program::instruction::AccountMeta::new_readonly(*sender.key, true),
      ],
      data: amount.clone(),
    };
    msg!("DEBUG: TransferToken Instruction {:?}", instruction);
    solana_program::program::invoke(&instruction, &[payer.clone(), sender.clone(), sender_token.clone(), recipient_token.clone()]);
    Ok(())
  }
}

#[derive(Accounts)]
pub struct TransferSolContext<'info> {
  #[account(signer)]
  pub payer: AccountInfo<'info>,
  #[account(signer)]
  pub sender: AccountInfo<'info>,
  #[account(mut)]
  pub recipient: AccountInfo<'info>,
  pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TransferTokenContext<'info> {
  #[account(signer)]
  pub payer: AccountInfo<'info>,
  #[account(signer)]
  pub sender: AccountInfo<'info>,
  #[account(mut)]
  pub sender_token: AccountInfo<'info>,
  #[account(mut)]
  pub recipient_token: AccountInfo<'info>,
  pub token_program: AccountInfo<'info>,
}

use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod indirect_transfer {
  use super::*;

  pub fn transfer_sol(
    ctx: Context<TransferSolContext>,
    amount: u64,
  ) -> Result<()> {
    msg!("Instruction: Transfer SOL");

    let payer = &ctx.accounts.payer;
    let sender = &ctx.accounts.sender;
    let recipient = &ctx.accounts.recipient;
    let instruction = &solana_program::system_instruction::transfer(sender.key, recipient.key, amount);
    msg!("DEBUG: Transfer Instruction {:?}", instruction);
    solana_program::program::invoke(&instruction, &[payer.clone(), sender.clone(), recipient.clone()])
      .expect("CPI failed");

    Ok(())
  }

  pub fn transfer_token(
    ctx: Context<TransferTokenContext>,
    amount: Vec<u8>,
  ) -> Result<()> {
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
    solana_program::program::invoke(&instruction, &[payer.clone(), sender.clone(), sender_token.clone(), recipient_token.clone()])
      .expect("CPI failed");

    Ok(())
  }
}

#[derive(Accounts)]
pub struct TransferSolContext<'info> {

  /// CHECK: Transaction fee payer
  #[account(signer)]
  pub payer: AccountInfo<'info>,

  /// CHECK: Source account to send lamports
  #[account(signer)]
  pub sender: AccountInfo<'info>,

  /// CHECK: Target account to receive lamports
  #[account(mut)]
  pub recipient: AccountInfo<'info>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferTokenContext<'info> {

  /// CHECK: Transaction fee payer
  #[account(signer)]
  pub payer: AccountInfo<'info>,

  /// CHECK: Owner of source account
  #[account(signer)]
  pub sender: AccountInfo<'info>,

  /// CHECK: Source account to send tokens
  #[account(mut)]
  pub sender_token: AccountInfo<'info>,

  /// CHECK: Target account to receive tokens
  #[account(mut)]
  pub recipient_token: AccountInfo<'info>,

  /// CHECK: Solana's native token program
  pub token_program: AccountInfo<'info>,
}

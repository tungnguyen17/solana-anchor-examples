use anchor_lang::{ AccountDeserialize, AccountSerialize, Accounts, AccountsExit, AnchorDeserialize, AnchorSerialize, program, Context,
  prelude::{ AccountInfo, borsh, msg, ProgramError, ProgramResult, Pubkey },
};

#[program]
mod indirect_transfer {
  use super::*;

  pub fn transfer_sol(
    ctx: Context<TransferSolContext>,
    amount: u64,
  ) -> ProgramResult {
    msg!("Instruction: Transfer SOL");
    Ok(())
  }
}

#[derive(Accounts)]
pub struct TransferSolContext<'info> {
  pub recipient: AccountInfo<'info>,
}

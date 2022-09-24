use anchor_lang::prelude::*;
use solana_program::{
  declare_id,
  instruction::{
    Instruction,
  },
  program::{
    invoke,
  },
  program_error::{
    ProgramError,
  },
};

declare_id!("Ed25519SigVerify111111111111111111111111111");

const HEADER_SIZE: usize = 2;
const SIGNATURE_OFFSET_SIZE: usize = 14;
const SIGNATURE_TUPLE_SIZE: usize = 96;
const PUBKEY_SIZE: usize = 32;

pub fn create_message_verification_instruction(
  message: &Vec<u8>,
  signatures: &Vec<SignatureTuple>,
) -> Vec<u8> {

  let mut data: Vec<u8> = Vec::new();

  // Fill header
  let header = InstructionHeader {
    length: signatures.len() as u8,
    padding: 0
  };
  let header_bytes = header.try_to_vec().unwrap();
  data.extend_from_slice(&header_bytes);

  let message_offset = HEADER_SIZE
    + (SIGNATURE_OFFSET_SIZE + SIGNATURE_TUPLE_SIZE) * signatures.len();

  // Fill signature offset
  for i in 0..signatures.len() {
    let sign_data_offset = HEADER_SIZE
      + SIGNATURE_OFFSET_SIZE * signatures.len()
      + SIGNATURE_TUPLE_SIZE * i;
    let sign_offset = SignatureOffset {
      signature_offset: (sign_data_offset + PUBKEY_SIZE) as u16,
      signature_instruction_index: u16::MAX,
      public_key_offset: sign_data_offset as u16,
      public_key_instruction_index: u16::MAX,
      message_data_offset: message_offset as u16,
      message_data_size: message.len() as u16,
      message_instruction_index: u16::MAX,
    };
    let sign_offset_bytes = sign_offset.try_to_vec().unwrap();
    data.extend_from_slice(&sign_offset_bytes);
  }

  // Fill signature data
  for i in 0..signatures.len() {
    let signature = signatures.get(i).unwrap();
    let signature_bytes = signature.try_to_vec().unwrap();
    data.extend_from_slice(&signature_bytes);
  }

  // Fill message
  data.extend_from_slice(message);

  data
}

pub fn verify_message_signatures(
  message: &Vec<u8>,
  signatures: &Vec<SignatureTuple>,
) -> std::result::Result<(), ProgramError> {

  let data = create_message_verification_instruction(
    message,
    signatures,
  );

  let instruction = Instruction {
    program_id: id(),
    accounts: vec![],
    data: data.try_to_vec().unwrap(),
  };

  invoke(&instruction, &[])
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SignatureTuple {
  pub public_key: Pubkey,
  pub signature: [u8;64],
}

#[derive(AnchorSerialize, AnchorDeserialize)]
struct InstructionHeader {
  pub length: u8,
  pub padding: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
struct SignatureOffset {
  signature_offset: u16,
  signature_instruction_index: u16,
  public_key_offset: u16,
  public_key_instruction_index: u16,
  message_data_offset: u16,
  message_data_size: u16,
  message_instruction_index: u16,
}

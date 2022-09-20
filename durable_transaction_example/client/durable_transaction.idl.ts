export const DURABLE_TRANSACTION_IDL = {
  "version": "0.1.0",
  "name": "durable_transaction",
  "instructions": [
    {
      "name": "invoke",
      "accounts": [
        {
          "name": "sender",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ]
}

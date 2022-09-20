export const DURABLE_TRANSACTION_IDL = {
  "version": "0.1.0",
  "name": "durable_transaction",
  "instructions": [
    {
      "name": "createCounter",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "derivationPath",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "invoke",
      "accounts": [
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "counter",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "invokeUnique",
      "accounts": [
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "counter",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Counter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signerCount",
            "type": "u8"
          }
        ]
      }
    }
  ]
}

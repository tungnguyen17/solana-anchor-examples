export const ED25519_VERIFICATION_IDL = {
  "version": "0.1.0",
  "name": "ed25519_verification",
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
      "name": "compareMessageSignature",
      "accounts": [],
      "args": [
        {
          "name": "message",
          "type": "bytes"
        },
        {
          "name": "signatures",
          "type": {
            "vec": {
              "defined": "SignatureTuple"
            }
          }
        },
        {
          "name": "instructionData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "validateMessageSignature",
      "accounts": [
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "bytes"
        },
        {
          "name": "signatures",
          "type": {
            "vec": {
              "defined": "SignatureTuple"
            }
          }
        }
      ]
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
  ],
  "types": [
    {
      "name": "SignatureTuple",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "publicKey",
            "type": "publicKey"
          },
          {
            "name": "signature",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidInput",
      "msg": "Invalid input"
    }
  ]
}

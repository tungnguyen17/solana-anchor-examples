export const ED25519_VERIFICATION_IDL = {
  "version": "0.1.0",
  "name": "ed25519_verification",
  "instructions": [
    {
      "name": "validateMessageSignature",
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

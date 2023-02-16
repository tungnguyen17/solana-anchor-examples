export const BASE64_TRANSFORM_IDL = {
  "version": "0.1.0",
  "name": "base64_transform",
  "instructions": [
    {
      "name": "decode",
      "accounts": [],
      "args": [
        {
          "name": "messageBase64Buffer",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "encode",
      "accounts": [],
      "args": [
        {
          "name": "sender",
          "type": "publicKey"
        },
        {
          "name": "timestamp",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "messageInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sender",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAccount",
      "msg": "Invalid Account."
    }
  ]
};

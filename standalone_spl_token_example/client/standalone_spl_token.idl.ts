export const STANDALONE_SPL_TOKEN_IDL = {
  "version": "0.1.0",
  "name": "standalone_spl_token",
  "instructions": [
    {
      "name": "readme",
      "accounts": [
        {
          "name": "token",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "types": [
    {
      "name": "AccountState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Uninitialized"
          },
          {
            "name": "Initialized"
          },
          {
            "name": "Frozen"
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
}

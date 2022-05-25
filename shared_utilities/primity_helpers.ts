import BN from 'bn.js'
import numeral from 'numeral'

export class NumericHelper {
  static formatBalance(balance: number | BN, decimals: number): string {
    if (!balance) {
      return '0'
    } else {
      const fmt = '0,0.000000'
      const division = Math.pow(10, decimals)
      if (typeof balance == 'number') {
        return numeral(balance / division).format(fmt)
      } else {
        const bigDivision = new BN(division)
        return numeral(balance.div(bigDivision).toNumber()).format(fmt)
      }
    }
  }
}

export class StringHelper {
  static asBase64ToJson(base64: string): string {
    return Buffer.from(base64, 'base64').toString()
  }

  static asJsonToBase64(json: string): string {
    const obj = JSON.parse(json)
    const minimizedJson = JSON.stringify(obj, null, 0)
    return Buffer.from(minimizedJson).toString('base64')
  }

  static isNullOrEmpty(str: string): boolean {
    if (typeof str === 'undefined' || str === null || str.length === 0) {
      return true
    }
    return false
  }
}

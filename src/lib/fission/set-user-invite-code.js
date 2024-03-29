import {
  userCollection
} from '../utils/config'

export default async function ({
  uid,
  myInviteCode
}) {
  const validResult = await this._getValidInviteCode({
    inviteCode: myInviteCode
  })
  if (validResult.code) {
    return validResult
  }
  await userCollection.doc(uid).update({
    my_invite_code: validResult.inviteCode
  })
  return {
    code: 0,
    msg: '',
    myInviteCode: validResult.inviteCode
  }
}

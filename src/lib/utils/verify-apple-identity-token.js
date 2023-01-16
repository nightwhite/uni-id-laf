import platformApi from '../../platforms/index'

async function verifyIdentityToken ({ identityToken, platform }) {
  const clientPlatform = platform || this.context.PLATFORM
  const { code, msg } = await platformApi.initApple({
    clientType: clientPlatform
  }).verifyIdentityToken(identityToken)

  if (code !== 0) {
    return {
      code,
      msg
    }
  }

  return {
    code,
    msg: '验证通过',
    ...msg
  }
}

export default verifyIdentityToken

import md5s from 'nd-md5s'
import request from 'utils/plato-request'
import { UC_RES } from 'utils/config'
import datetime from 'nd-datetime'
const { base } = UC_RES

let cache

const macMock = async () => {
  cache = localStorage.getItem('token')
  if (cache) {
    cache = JSON.parse(cache)
    if (Date.now() < (datetime(cache.expires_at).toNumber() - cache.diff)) {
      return cache
    }
  }
  const data = await request({
    url: `${base}/tokens`,
    method: 'POST',
    body: {
      login_name: '830624',
      org_name: 'ndtest',
      password: md5s('123456', '\xa3\xac\xa1\xa3fdjf,jkgfkl')
    }
  })
  data.diff = datetime(data.server_time).toNumber() - Date.now()
  localStorage.setItem('token', JSON.stringify(data))
  cache = data
  return data
}

export default macMock

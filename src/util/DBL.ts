import axiosInit from 'axios'
import { Agent } from 'https'
import { dblKey } from '../config'
import { client } from '../index'

const axios = axiosInit.create({
  httpsAgent: new Agent({
    rejectUnauthorized: false
  })
})

export async function postServerCount (serverCount: number) {
  const response = await axios.post(`https://discordbots.org/api/bots/${client.user.id}/stats`, {
    server_count: serverCount
  }, {
    headers: { Authorization: dblKey }
  }).catch(error => {
    console.log(error)
  })

  console.log(response ? 'Successfully posted server count' : 'Server count couldn\'t be posted.')
}

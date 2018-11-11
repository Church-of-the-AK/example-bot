import axios from 'axios'

export async function createHaste (data: string, extension: string) {
  const response = await axios.post('https://hastebin.com/documents', data)
  return 'https://hastebin.com/' + response.data.key + (extension ? '.' + extension : '')
}

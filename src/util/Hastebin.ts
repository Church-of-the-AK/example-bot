import axios from 'axios'

export async function createHaste (data: string, extension: string): Promise<string | void> {
  const response = await axios.post('https://hastebin.com/documents', data).catch(error => console.log(error))

  if (response) {
    return 'https://hastebin.com/' + response.data.key + (extension ? '.' + extension : '')
  }
}

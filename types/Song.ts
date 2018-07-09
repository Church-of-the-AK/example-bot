export interface Song {
  /**
   * The ID of the YouTube video, e.g. https://www.youtube.com/watch?v=`song.id`
   */
  id: string,
  /**
   * The title of the song, with any markdown characters escaped.
   */
  title: string,
  /**
   * The url of the song, e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ
   */
  url: string
}

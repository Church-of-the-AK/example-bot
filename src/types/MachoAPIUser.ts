export interface MachoAPIUser {
  /**
   * The Discord ID of the user.
   */
  id: string,
  /**
   * The Discord username of the user.
   */
  name: string,
  /**
   * The Discord avatar url of the user.
   */
  avatarurl: string,
  /**
   * If the user is banned from all of Macho or not.
   */
  banned: boolean,
  /**
   * The date the user was created in the API, in ms since epoch.
   */
  datecreated: string,
  /**
   * The date of the last message of the user, in ms since epoch.
   */
  datelastmessage: string,
  /**
   * The SteamId64 of the user, or null if they haven't linked a Steam account.
   */
  steamid: string,
  /**
   * The level data of the user.
   */
  level: {
    /**
     * The amount of XP the user has, resets every level-up.
     */
    xp: string,
    /**
     * The user's level.
     */
    level: string,
    /**
     * The last time the user sent a message, in ms since epoch.
     */
    timestamp: string
  },
  /**
   * The balance data of the user.
   */
  balance: {
    /**
     * How much the user is worth.
     */
    networth: string,
    /**
     * The amount of credits the user has.
     */
    balance: string,
    /**
     * The date of the user's last valid use of the `dailies` command, in ms since epoch.
     */
    dateclaimeddailies: string
  },
  /**
   * The user's last vakid Discord access token, only accessible by the API.
   */
  accesstoken: string,
  /**
   * Whether or not the user is an API-wide admin.
   */
  admin: boolean
}

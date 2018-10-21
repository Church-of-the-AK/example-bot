import { appendFileSync } from 'fs'

/**
 * Log a message to the log.txt file.
 * @param msg What to log.
 */
export function log (msg: string): void {
  appendFileSync('log.txt', msg)
}

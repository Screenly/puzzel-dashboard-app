import { Database } from 'bun:sqlite'

const db = new Database('auth.db')

db.run(`
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY,
    access_token TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`)

export interface StoredToken {
  access_token: string
  expires_at: number
  tenant_id: string
  user_id: string
}

export function saveToken(token: StoredToken): void {
  db.run('DELETE FROM tokens')
  db.run(
    'INSERT INTO tokens (access_token, expires_at, tenant_id, user_id) VALUES (?, ?, ?, ?)',
    [token.access_token, token.expires_at, token.tenant_id, token.user_id]
  )
}

export function loadToken(): StoredToken | null {
  return (
    db
      .query<StoredToken, []>(
        'SELECT access_token, expires_at, tenant_id, user_id FROM tokens LIMIT 1'
      )
      .get() ?? null
  )
}

export function clearToken(): void {
  db.run('DELETE FROM tokens')
}

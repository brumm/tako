// Uploads and publishes a zip to the Chrome Web Store (API v2) as a service account.
// Usage: node publish-chrome.mjs <zip>
// Env: CWS_SERVICE_ACCOUNT_KEY (JSON key), CWS_PUBLISHER_ID, CWS_EXTENSION_ID

import { createSign } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const API = 'https://chromewebstore.googleapis.com'
const SCOPE = 'https://www.googleapis.com/auth/chromewebstore'

const [zipPath] = process.argv.slice(2)
const { CWS_SERVICE_ACCOUNT_KEY, CWS_PUBLISHER_ID, CWS_EXTENSION_ID } =
  process.env
if (
  !zipPath ||
  !CWS_SERVICE_ACCOUNT_KEY ||
  !CWS_PUBLISHER_ID ||
  !CWS_EXTENSION_ID
) {
  fail('Usage: node publish-chrome.mjs <zip> with CWS_* env vars set')
}

const item = `publishers/${CWS_PUBLISHER_ID}/items/${CWS_EXTENSION_ID}`

const token = await getAccessToken(parseServiceAccountKey())

console.log(`Uploading ${zipPath} to ${item}`)
let upload = await request(`${API}/upload/v2/${item}:upload`, {
  method: 'POST',
  body: await readFile(zipPath),
  headers: { 'Content-Type': 'application/zip' },
})
for (let attempt = 0; upload.uploadState === 'IN_PROGRESS'; attempt++) {
  if (attempt === 30) {
    fail('Upload still in progress after 5 minutes')
  }
  await new Promise((resolve) => setTimeout(resolve, 10_000))
  const status = await request(`${API}/v2/${item}:fetchStatus`)
  upload = { uploadState: status.lastAsyncUploadState }
}
if (upload.uploadState !== 'SUCCEEDED') {
  fail(`Upload failed: ${JSON.stringify(upload)}`)
}
console.log(`Uploaded version ${upload.crxVersion ?? '(pending)'}`)

console.log('Publishing')
const publish = await request(`${API}/v2/${item}:publish`, {
  method: 'POST',
  body: '{}',
  headers: { 'Content-Type': 'application/json' },
})
console.log(JSON.stringify(publish, null, 2))

// JSON.parse errors quote the input, which would leak key material into logs
function parseServiceAccountKey() {
  try {
    const { client_email, private_key } = JSON.parse(CWS_SERVICE_ACCOUNT_KEY)
    if (client_email && private_key) {
      return { client_email, private_key }
    }
  } catch {}
  fail('CWS_SERVICE_ACCOUNT_KEY is not a valid service account JSON key')
}

async function getAccessToken({ client_email, private_key }) {
  const now = Math.floor(Date.now() / 1000)
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`
  const signature = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(private_key, 'base64url')

  const { access_token } = await request(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${unsigned}.${signature}`,
      }),
    },
    false,
  )
  return access_token
}

async function request(url, init = {}, authenticated = true) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      ...(authenticated && { Authorization: `Bearer ${token}` }),
    },
  })
  const body = await response.text()
  if (!response.ok) {
    fail(`${init.method ?? 'GET'} ${url} → ${response.status}\n${body}`)
  }
  return JSON.parse(body)
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

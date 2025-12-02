import { http, HttpResponse } from 'msw'

export const githubHandlers = [
  // GET /repos/{owner}/{repo}/contents/{path}
  http.get('https://api.github.com/repos/:owner/:repo/contents/:path*', () => {
    return HttpResponse.json([
      {
        name: 'README.md',
        path: 'README.md',
        sha: 'abc123',
        size: 100,
        url: 'https://api.github.com/repos/brumm/tako/contents/README.md',
        html_url: 'https://github.com/brumm/tako/blob/main/README.md',
        git_url: 'https://api.github.com/repos/brumm/tako/git/blobs/abc123',
        download_url: 'https://raw.githubusercontent.com/brumm/tako/main/README.md',
        type: 'file',
      },
      {
        name: 'src',
        path: 'src',
        sha: 'def456',
        size: 0,
        url: 'https://api.github.com/repos/brumm/tako/contents/src',
        html_url: 'https://github.com/brumm/tako/tree/main/src',
        git_url: 'https://api.github.com/repos/brumm/tako/git/trees/def456',
        download_url: null,
        type: 'dir',
      },
    ])
  }),

  // GET /repos/{owner}/{repo}/commits
  http.get('https://api.github.com/repos/:owner/:repo/commits', () => {
    return HttpResponse.json(
      [
        {
          sha: 'abc123def456',
          commit: {
            author: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2025-01-01T00:00:00Z',
            },
            message: 'test commit',
          },
          html_url: 'https://github.com/brumm/tako/commit/abc123def456',
          author: {
            login: 'brumm',
            avatar_url: 'https://github.com/brumm.png',
          },
        },
      ],
      {
        headers: {
          Link: '<https://api.github.com/repos/brumm/tako/commits?page=100&per_page=1>; rel="last"',
        },
      },
    )
  }),

  // GET /repos/{owner}/{repo}/git/blobs/{sha}
  http.get('https://api.github.com/repos/:owner/:repo/git/blobs/:sha', () => {
    return HttpResponse.json({
      sha: 'abc123',
      content: btoa('# Tako\n\nTest README content'),
      encoding: 'base64',
    })
  }),

  // POST /markdown
  http.post('https://api.github.com/markdown', () => {
    return HttpResponse.text('<h1>Tako</h1>\n<p>Test README content</p>')
  }),
]

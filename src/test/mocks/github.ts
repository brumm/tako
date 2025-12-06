import { graphql, http, HttpResponse } from 'msw'

const github = graphql.link('https://api.github.com/graphql')

export const githubHandlers = [
  // GraphQL API - Repository contents query
  github.operation(({ query }) => {
    const queryStr = query as string

    // Handle repository tree query for directory contents
    if (queryStr.includes('... on Tree')) {
      return HttpResponse.json({
        data: {
          repository: {
            object: {
              entries: [
                {
                  name: 'README.md',
                  path: 'README.md',
                  type: 'blob',
                  mode: '100644',
                  oid: 'abc123',
                  object: null,
                },
                {
                  name: 'src',
                  path: 'src',
                  type: 'tree',
                  mode: '040000',
                  oid: 'def456',
                  object: null,
                },
              ],
            },
          },
        } as any,
      })
    }

    // Handle symlink resolution query (Blob text)
    if (queryStr.includes('... on Blob') && queryStr.includes('text')) {
      // Extract path from query to determine what to return
      if (queryStr.includes('link-to-file')) {
        return HttpResponse.json({
          data: {
            repository: {
              object: {
                text: 'README.md',
              },
            },
          } as any,
        } as any)
      }
      if (queryStr.includes('link-to-dir')) {
        return HttpResponse.json({
          data: {
            repository: {
              object: {
                text: 'src',
              },
            },
          } as any,
        })
      }
      if (queryStr.includes('link-with-dotdot')) {
        return HttpResponse.json({
          data: {
            repository: {
              object: {
                text: '../README.md',
              },
            },
          } as any,
        })
      }
      if (queryStr.includes('nested/link')) {
        return HttpResponse.json({
          data: {
            repository: {
              object: {
                text: '../../README.md',
              },
            },
          } as any,
        })
      }
      if (queryStr.includes('link-with-dot')) {
        return HttpResponse.json({
          data: {
            repository: {
              object: {
                text: './README.md',
              },
            },
          } as any,
        })
      }
    }

    // Handle symlink target metadata query (check if target exists)
    if (queryStr.includes('__typename') && queryStr.includes('oid')) {
      // Check if querying for a directory (src)
      if (
        queryStr.includes(':src"') ||
        queryStr.includes(':../src"') ||
        queryStr.includes(':src/utils"')
      ) {
        return HttpResponse.json({
          data: {
            repository: {
              object: {
                __typename: 'Tree',
                oid: 'def456',
              },
            },
          } as any,
        })
      }
      // Check for valid file paths (README.md, helper.ts, etc.)
      if (
        queryStr.includes(':README.md"') ||
        queryStr.includes(':src/utils/helper.ts"')
      ) {
        return HttpResponse.json({
          data: {
            repository: {
              object: {
                __typename: 'Blob',
                oid: 'abc123',
              },
            },
          } as any,
        })
      }
      // Return null for non-existent paths
      return HttpResponse.json({
        data: { repository: { object: null } },
      } as any)
    }

    return HttpResponse.json({ data: null })
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

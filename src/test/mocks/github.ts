import { graphql, http, HttpResponse } from 'msw'

const github = graphql.link('https://api.github.com/graphql')

type MockObject =
  | { __typename: 'Tree'; oid: string; entries: unknown[] }
  | { __typename: 'Blob'; oid: string; text: string }

const treeEntry = (
  name: string,
  path: string,
  type: 'blob' | 'tree' | 'commit',
  mode: number,
  submodule: { gitUrl: string } | null = null,
) => ({ name, path, type, mode, oid: `${path}-oid`, submodule })

export const mockRepoObjects: Record<string, MockObject> = {
  '': {
    __typename: 'Tree',
    oid: 'root-oid',
    entries: [
      treeEntry('README.md', 'README.md', 'blob', 33188),
      treeEntry('src', 'src', 'tree', 16384),
    ],
  },
  src: {
    __typename: 'Tree',
    oid: 'src-oid',
    entries: [treeEntry('index.ts', 'src/index.ts', 'blob', 33188)],
  },
  'README.md': { __typename: 'Blob', oid: 'abc123', text: '# Tako' },
  'src/index.ts': { __typename: 'Blob', oid: 'file123', text: '' },
  'link-to-file': { __typename: 'Blob', oid: 'l1', text: 'README.md' },
  'link-to-dir': { __typename: 'Blob', oid: 'l2', text: 'src' },
  'src/link-with-dotdot': {
    __typename: 'Blob',
    oid: 'l3',
    text: '../README.md',
  },
  'nested/deeper/link': {
    __typename: 'Blob',
    oid: 'l4',
    text: '../../README.md',
  },
  'link-with-dot': { __typename: 'Blob', oid: 'l5', text: './README.md' },
  'broken-link': { __typename: 'Blob', oid: 'l6', text: 'non-existent-file' },
}

export const githubHandlers = [
  // GraphQL objects are looked up by the path in `expression` ("ref:path")
  github.operation<
    { repository: { object: MockObject | null } },
    { expression: string }
  >(({ variables: { expression } }) => {
    const path = expression.slice(expression.indexOf(':') + 1)
    return HttpResponse.json({
      data: { repository: { object: mockRepoObjects[path] ?? null } },
    })
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

  // GET /repos/{owner}/{repo}/contents/{path}
  http.get(
    'https://api.github.com/repos/:owner/:repo/contents/*',
    ({ params }) => {
      const object = mockRepoObjects[params[0] as string]
      if (object?.__typename !== 'Blob') {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 })
      }
      return HttpResponse.json({
        type: 'file',
        encoding: 'base64',
        content: btoa(object.text),
      })
    },
  ),

  // GET github.com/{owner}/{repo}/tree-commit-info/{ref}/{path}
  http.get(
    'https://github.com/:owner/:repo/tree-commit-info/:ref/*?',
    ({ params }) => {
      const tree = mockRepoObjects[(params[0] as string | undefined) ?? '']
      if (tree?.__typename !== 'Tree') {
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 })
      }
      const entries = (tree.entries as Array<{ name: string }>).map(
        ({ name }) => [
          name,
          {
            oid: 'abc123def456',
            url: '/brumm/tako/commit/abc123def456',
            date: '2025-01-01T00:00:00.000Z',
            shortMessageHtmlLink: {
              value:
                '<a title="test commit\n\nbody" href="/brumm/tako/commit/abc123def456">test commit</a>',
            },
          },
        ],
      )
      return HttpResponse.json({ entries: Object.fromEntries(entries) })
    },
  ),

  // POST /markdown
  http.post('https://api.github.com/markdown', () => {
    return HttpResponse.text('<h1>Tako</h1>\n<p>Test README content</p>')
  }),
]

import React, { Fragment } from 'react'
import { useQuery } from 'react-query'

import queryClient from '@/queryClient'
import { useStore } from '@/storage'
import { getNode } from '@/api'
import { markAsPrefetch } from '@/utils'
import Node from '@/components/Node'

const Listing = ({ path, parentCommitmessage, level = 0 }) => {
  const { user, repo, branch } = useStore(state => state.repoDetails)
  const { status, data, error } = useQuery(
    ['listing', { user, repo, branch, path }],
    markAsPrefetch(getNode)
  )

  React.useEffect(() => {
    if (data) {
      data.forEach(({ path, type }) => {
        if (type === 'dir') {
          queryClient.prefetchQuery(
            ['listing', { user, repo, branch, path }],
            (...args) => getNode(...args, true)
          )
        }
      })
    }
  }, [status, branch, data, user, repo])

  if (status === 'loading') {
    return null
  }

  if (status === 'error') {
    throw error
  }

  return (
    <Fragment>
      {data &&
        data.map(node => (
          <Node
            key={node.path}
            {...node}
            level={level}
            parentCommitmessage={parentCommitmessage}
          />
        ))}
    </Fragment>
  )
}

export default Listing

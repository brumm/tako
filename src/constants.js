export const APP_MOUNT_SELECTOR =
  'table.files, .file-navigation + div .Details [role=grid]'

export const TOOLBAR_MOUNT_SELECTOR =
  '.commit-tease > div:nth-child(3), .file-navigation + div ul.list-style-none.d-flex'

export const QUERY_CONFIG = {
  refetchAllOnWindowFocus: false,
  staleTime: 10 * 60 * 1000,
}

export const SORT_ORDER = ['dir', 'file']

export const INDENT_SIZE = 24

export const IMAGE_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp']

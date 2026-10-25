import { ReactNode } from 'react'
import { usePreview } from '../hooks/usePreview'
import { useTakoStore } from '../store'

export const Preview = () => {
  const previewedFile = useTakoStore((state) => state.previewedFile)!
  const preview = usePreview(previewedFile)

  switch (preview.kind) {
    case 'loading': {
      return null
    }
    case 'unknown': {
      return (
        <div className="border-left d-flex flex-items-center flex-justify-center width-full">
          Can&apos;t preview this file
        </div>
      )
    }
    case 'empty': {
      return (
        <div className="border-left d-flex flex-items-center flex-justify-center width-full">
          <div className="d-flex flex-column gap-1 flex-items-center color-fg-muted">
            <FileIcon />
            <div>Empty file</div>
          </div>
        </div>
      )
    }
    case 'image': {
      return (
        <div className="p-3 border-left width-full">
          <img
            src={preview.src}
            alt={previewedFile.path}
            style={{ maxWidth: '100%' }}
          />
        </div>
      )
    }
    case 'markdown': {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: preview.html }}
          className="overflow-auto markdown-body border-left p-3 width-full"
        />
      )
    }
    case 'code': {
      return (
        <LineNumbers text={preview.text}>
          {preview.html ? (
            <div dangerouslySetInnerHTML={{ __html: preview.html }} />
          ) : (
            <pre>{preview.text}</pre>
          )}
        </LineNumbers>
      )
    }
  }
}

const LineNumbers = ({
  text = '',
  children,
}: {
  text?: string
  children: ReactNode
}) => {
  const lines = Array.from(
    { length: text.trim().split('\n').length || 0 },
    (_, i) => i + 1,
  )
  return (
    <div className="d-flex border-left p-3 gap-3 overflow-auto width-full">
      <pre className="color-fg-subtle text-right">
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </pre>
      {children}
    </div>
  )
}

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    className="octicon octicon-file"
  >
    <path d="M3 3a2 2 0 0 1 2-2h9.982a2 2 0 0 1 1.414.586l4.018 4.018A2 2 0 0 1 21 7.018V21a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm2-.5a.5.5 0 0 0-.5.5v18a.5.5 0 0 0 .5.5h14a.5.5 0 0 0 .5-.5V8.5h-4a2 2 0 0 1-2-2v-4Zm10 0v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 0-.146-.336l-4.018-4.018A.5.5 0 0 0 15 2.5Z"></path>
  </svg>
)

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { IconUpload, IconFile, IconX } from './Icons'

export default function FileUpload({ onFiles, multiple = false, files = [] }) {
  const onDrop = useCallback((accepted) => {
    if (multiple) {
      onFiles(prev => {
        const existing = new Set(prev.map(f => f.name))
        return [...prev, ...accepted.filter(f => !existing.has(f.name))]
      })
    } else {
      onFiles(accepted.slice(0, 1))
    }
  }, [onFiles, multiple])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple,
  })

  const removeFile = (name) => {
    if (multiple) onFiles(prev => prev.filter(f => f.name !== name))
    else onFiles([])
  }

  return (
    <div>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-icon">
          <IconUpload />
        </div>
        <p style={{ fontWeight: 600, color: 'var(--ln-text)', marginBottom: '4px', fontSize: '0.9rem' }}>
          {isDragActive ? 'Release to upload' : 'Drag and drop files here'}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--ln-text-muted)', marginBottom: '12px' }}>
          Supports PDF and DOCX{multiple ? ' — multiple files allowed' : ''}
        </p>
        <button type="button" className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
          Browse files
        </button>
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {files.map(f => (
            <div key={f.name} className="file-tag">
              <IconFile />
              <span className="file-tag-name" title={f.name}>
                {f.name.length > 28 ? f.name.slice(0, 26) + '...' : f.name}
              </span>
              <button className="file-tag-remove" onClick={() => removeFile(f.name)} title="Remove file">
                <IconX />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

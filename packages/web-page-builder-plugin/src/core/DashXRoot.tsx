import React, { createContext, useState, ReactNode } from 'react'

const DashContext = createContext<object>({})

type DashXRootProps = {
  children: ReactNode,
  page: any
}

function DashProvider({ children, page }: DashXRootProps) {
  const [ store, setStore ] = useState(page)
  const [ selected, setSelected ] = useState(null)
  const [ isSidebarOpen, setIsSidebarOpen ] = useState(false)

  // Dummy data for fields for HeroBLock, normalized by ContentType ID
  // to be present in page.fields in future
  const dummyFields = {
    524: {
      fields: [ {
        type: 'text',
        name: 'title'
      }, {
        type: 'text',
        name: 'subtitle'
      } ]
    },
    525: {
      fields: [ {
        type: 'text',
        name: 'heading'
      } ]
    }
  }

  const [ fields, setFields ] = useState(dummyFields)

  page.blocks = page.blocks.map((block: Record<string, any>) => (
    { ...block,
      blockProps: {
        onClick: () => {
          if (selected === block.id) {
            setIsSidebarOpen((prev) => !prev)
          }

          setSelected(block.id)
        },
        className: 'dash_hovered'
      } }
  ))

  return (
    <DashContext.Provider value={{ selected, store, setStore, fields, isSidebarOpen }}>
      <style>{'.block::hover { border: 1px solid red }'}</style>
      {children}
    </DashContext.Provider>
  )
}

export default DashProvider

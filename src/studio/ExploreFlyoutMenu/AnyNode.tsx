import React from 'react'
import {
  VolatileId,
  GenericNode,
} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import TextNode from './TextNode'
import RegularNode from './RegularNode'
import {isViewportElement} from '$studio/workspace/components/WhatToShowInBody/Viewports/Viewport'
import ViewportNode from './ViewportNode'

type Props = {
  depth: number
  volatileId: VolatileId
}

const AnyNode = (props: Props): React.ReactElement<any> => (
  <PropsAsPointer props={props}>
    {(propsP: Pointer<Props>, studio) => {
      // @todo @perf if depth and volatileId never change per Node, then we should read them directly from props
      const volatileId = val(propsP.volatileId)

      const nodeP =
        studio.elementTree.mirrorOfReactTreeAtom.pointer.nodesByVolatileId[
          volatileId
        ]

      const type = val(nodeP.type)

      if (type === 'Text') {
        return (
          <TextNode
            volatileId={val(propsP.volatileId)}
            depth={val(propsP.depth)}
          />
        )
      } else if (type === 'Wrapper') {
        debugger
        throw new Error(`@todo Find a way to display Wrapper nodes`)
      } else {
        const nativeNode = val((nodeP as Pointer<GenericNode>).nativeNode)
        if (isViewportElement(nativeNode)) {
          return (
            <ViewportNode
              volatileId={val(propsP.volatileId)}
              depth={val(propsP.depth)}
            />
          )
        } else {
          return (
            <RegularNode
              volatileId={val(propsP.volatileId)}
              depth={val(propsP.depth)}
            />
          )
        }
      }
    }}
  </PropsAsPointer>
)

export default AnyNode
import {React, reduceStateAction, connect} from '$src/studio/handy'
// import css from './index.css'
// import Settings from './Settings'
import cx from 'classnames'
import {
  XY,
  PanelPlacementSettings,
  PanelType,
  PanelConfiguration,
  PanelPersistentState,
  PanelOutput,
  DraggingOutput,
} from '$src/studio/workspace/types'

import {
  getPanelById,
  getCurrentlyDraggingOutput,
  getPanelInputs,
  getActivePanelId,
} from '$src/studio/workspace/selectors'

import panelTypes from '$src/studio/workspace/panelTypes'
import {Broadcast} from 'react-broadcast'

export const PanelControlChannel = 'TheaterJS/PanelControlChannel'

export interface IPanelControlChannelData {
  panelId: string
  isActive: boolean
  label: string
  isInEditMode: boolean  
  boundaries: $FixMe
  gridOfBoundaries: $FixMe
  updatePanelBoundaries: Function
}

type OwnProps = {
  panelId: string
  isInEditMode: boolean
  boundaries: $FixMe
  gridOfBoundaries: $FixMe
  updatePanelBoundaries: Function
}

type Props = OwnProps & {
    dispatch: Function
    type: PanelType
    configuration: PanelConfiguration
    persistentState: PanelPersistentState
    currentlyDraggingOutput: DraggingOutput
    outputs: PanelOutput
    inputs: {[k: string]: Object}
    isActive: boolean
  }

interface IBoundary {
  xlow: number
  xhigh: number
  ylow: number
  yhigh: number
}

interface IPanelPlacementState {
  move: XY
  resize: XY
  moveBoundaries: IBoundary
  resizeBoundaries: IBoundary
}

type State = IPanelPlacementState & {
  isMoving: boolean
}

class PanelController extends React.Component<Props, State> {
  panelComponents: {
    Content: React.ComponentType<$FixMe>
    Settings: React.ComponentType<$FixMe>
  }

  static defaultProps = {
    persistentState: {
      isInSettings: true,
    },
    outputs: {},
  }

  constructor(props: Props) {
    super(props)
  }

  render() {
    const {props} = this
    const {
      persistentState: {isInSettings, ...componentState},
      configuration,
      // currentlyDraggingOutput,
      outputs,
      inputs,
      type,
    } = props
    const panelType = panelTypes[type]
    const panelComponents = panelType.components

    const panelControlChannelData: IPanelControlChannelData = {
      panelId: props.panelId,
      isActive: props.isActive,
      label: panelType.label,
      isInEditMode: props.isInEditMode,
      boundaries: props.boundaries,
      gridOfBoundaries: props.gridOfBoundaries,
      updatePanelBoundaries: props.updatePanelBoundaries,
    }

    return (
      <Broadcast channel={PanelControlChannel} value={panelControlChannelData}>
        <panelComponents.Content
          {...configuration}
          {...componentState}
          // panelDimensions={dim}
          outputs={outputs}
          inputs={inputs}
          updatePanelOutput={this.updatePanelOutput}
        />
      </Broadcast>
    )

    // return (
    //   <div
    //     className={cx(css.container, {
    //       [css.isActive]: this.props.isActive,
    //       [css.headerLess]: panelConfig.headerLess === true,
    //     })}
    //     style={style}
    //   >
    //     <div className={css.innerWrapper}>
    //       <div className={css.topBar}>
    //         <div className={css.title}>{panelTypes[this.props.type].label}</div>
    //         {/*<div
    //         className={css.settings}
    //         onClick={this.toggleSettings}>
    //         {isInSettings ? 'Show Content' : 'Show Settings'}
    //       </div>*/}
    //       </div>

    //       <div className={css.content}>
    //         {isInSettings ? (
    //           <Settings
    //             onPanelDrag={this.movePanel}
    //             onPanelDragEnd={this.setPanelPosition}
    //             onPanelResize={this.resizePanel}
    //             onPanelResizeEnd={this.setPanelSize}
    //           >
    //             <panelComponents.Settings
    //               {...configuration}
    //               inputs={inputs}
    //               currentlyDraggingOutput={currentlyDraggingOutput}
    //               setCurrentlyDraggingOutput={this.setCurrentlyDraggingOutput}
    //               clearCurrentlyDraggingOutput={
    //                 this.clearCurrentlyDraggingOutput
    //               }
    //               updatePanelInput={newData =>
    //                 this.updatePanelData('inputs', newData)
    //               }
    //               updatePanelConfig={newData =>
    //                 this.updatePanelData('configuration', newData)
    //               }
    //             />
    //           </Settings>
    //         ) : (
    //           <panelComponents.Content
    //             {...configuration}
    //             {...componentState}
    //             panelDimensions={dim}
    //             outputs={outputs}
    //             inputs={inputs}
    //             updatePanelOutput={newData =>
    //               this.updatePanelData('outputs', newData)
    //             }
    //           />
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // )
  }

  updatePanelOutput = (newData: mixed) => {
    return this.updatePanelData('outputs', newData);
  }
}

export default connect((s, op: OwnProps) => {
  const {
    type,
    configuration,
    placementSettings,
    persistentState,
    outputs,
    inputs,
  } = getPanelById(s, op.panelId)
  const currentlyDraggingOutput = getCurrentlyDraggingOutput(s)

  return {
    type,
    configuration,
    persistentState,
    ...placementSettings,
    currentlyDraggingOutput,
    outputs,
    inputs: getPanelInputs(s, inputs),
    isActive: getActivePanelId(s) === op.panelId,
  }
})(PanelController)

import * as css from './VariablesBox.css'
<<<<<<< HEAD:src/theater/AnimationTimelinePanel/VariablesBox.tsx
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
import {MODE_SHIFT} from '$theater/workspace/components/StudioUI/StudioUI'
import BoxLegends from '$theater/AnimationTimelinePanel/BoxLegends'
import {ITheaterStoreState} from '$theater/types'
=======
import DraggableArea from '$src/studio/common/components/DraggableArea/DraggableArea'
import {MODES} from '$src/studio/common/components/ActiveModeDetector/ActiveModeDetector'
import BoxLegends from '$src/studio/AnimationTimelinePanel/BoxLegends'
import {IStudioStoreState} from '$src/studio/types'
>>>>>>> create active mode detector component:src/studio/AnimationTimelinePanel/VariablesBox.tsx
import {Broadcast} from 'react-broadcast'
import {
  VariableObject,
  VariableID,
} from '$theater/AnimationTimelinePanel/types'
import BoxView, {colors} from '$theater/AnimationTimelinePanel/BoxView'
import cx from 'classnames'
import _, {clamp} from 'lodash'
import React from 'react'
import connect from '$theater/handy/connect'

interface IOwnProps {
  boxIndex: number
  boxId: string
  translateY: number
  svgHeight: number
  svgWidth: number
  activeMode: string
  variableIds: VariableID[]
  splitVariable: Function
  duration: number
  canBeMerged: boolean
  shouldIndicateMerge: boolean
  pathToTimeline: string[]
  scrollLeft: number
  isABoxBeingDragged: boolean
  onMoveStart: Function
  onMoveEnd: Function
  onMove: Function
  onResizeStart: Function
  onResize: Function
  onResizeEnd: Function
  addPointToSelection: Function
  removePointFromSelection: Function
  selectionBoundaries?: Object //$FixMe
}

interface IProps extends IOwnProps {
  variables: VariableObject[]
  pathToVariables: string[]
  dispatch: Function
}

interface IState {
  activeVariableId: VariableID
  isMoving: boolean
  moveY: number
  resizeY: number
  shouldDisableResizeHandle: boolean
}

const minBoxHeight = 40
export const SelectionBoundariesChannel = 'TheaterJS/SelectionBoundariesChannel'

class VariablesBox extends React.PureComponent<IProps, IState> {
  resizeEndTimeout: $FixMe

  constructor(props: IProps) {
    super(props)

    this.state = {
      activeVariableId: props.variableIds[0],
      isMoving: false,
      moveY: 0,
      resizeY: 0,
      shouldDisableResizeHandle: false,
    }
  }

  componentWillReceiveProps(nextProps: IProps) {
    const {activeVariableId} = this.state
    if (nextProps.variableIds.find(id => id === activeVariableId) == null) {
      this.setState(() => ({activeVariableId: nextProps.variableIds[0]}))
    }
  }

  onMoveStart = (e: $FixMe) => {
    e.stopPropagation()
    this.setState(() => ({isMoving: true}))
    this.props.onMoveStart(this.props.boxIndex)
  }

  onMove = (_: number, dy: number) => {
    this.setState(() => ({moveY: dy}))
    this.props.onMove(dy)
  }

  onMoveEnd = () => {
    this.setState(() => ({
      isMoving: false,
      moveY: 0,
    }))
    this.props.onMoveEnd()
  }

  onResize = (_: number, dy: number) => {
    const resizeY = clamp(dy, minBoxHeight - this.props.svgHeight, dy)
    this.setState(() => ({resizeY}))
  }

  onResizeEnd = () => {
    this.setState(state => {
      this.props.onResize(
        this.props.boxId,
        this.props.svgHeight + state.resizeY,
      )
      return {
        resizeY: 0,
        shouldDisableResizeHandle: false,
      }
    })
  }

  _handleResizeOnPinch = (e: $FixMe) => {
    if (e.ctrlKey && e.shiftKey) {
      clearTimeout(this.resizeEndTimeout)
      e.preventDefault()
      e.stopPropagation()

      const dy = this.state.resizeY - 3 * e.deltaY
      this.setState(() => ({
        resizeY: _.clamp(dy, minBoxHeight - this.props.svgHeight, dy),
        shouldDisableResizeHandle: true,
      }))

      this.resizeEndTimeout = setTimeout(this.onResizeEnd, 100)
    }
  }

  setActiveVariable = (activeVariableId: string) => {
    this.setState(() => ({activeVariableId}))
  }

  addPointToSelection = (
    variableId: string,
    variableExtremums: Object,
    pointIndex: number,
    pointData: Object,
  ) => {
    this.props.addPointToSelection(
      this.props.boxIndex,
      variableId,
      variableExtremums,
      pointIndex,
      pointData,
    )
  }

  removePointFromSelection = (variableId: string, pointIndex: number) => {
    this.props.removePointFromSelection(
      this.props.boxIndex,
      variableId,
      pointIndex,
    )
  }

  render() {
    const {props, state} = this
    const {
      variables,
      boxIndex,
      splitVariable,
      translateY,
      canBeMerged,
      shouldIndicateMerge,
      isABoxBeingDragged,
      activeMode,
      selectionBoundaries,
    } = props

    const {activeVariableId, moveY, isMoving, shouldDisableResizeHandle} = state
    const svgHeight = props.svgHeight + state.resizeY

    const containerStyle = {
      height: svgHeight,
      ...(!isMoving && translateY !== 0
        ? {transform: `translateY(${translateY}px)`}
        : {}),
    }
    const wrapperStyle = {
      '--height': svgHeight,
      ...(isMoving ? {transform: `translateY(${moveY}px)`} : {}),
    }
    return (
      <div
        className={cx(css.container, {
          [css.canBeMerged]: canBeMerged,
          [css.indicateMerge]: shouldIndicateMerge,
          [css.isMoving]: isMoving,
          [css.isABoxBeingDragged]: isABoxBeingDragged,
        })}
        style={containerStyle}
      >
        <div className={css.wrapper} style={wrapperStyle}>
          <DraggableArea
            shouldRegisterEvents={activeMode === MODES.shift}
            onDragStart={this.onMoveStart}
            onDrag={this.onMove}
            onDragEnd={this.onMoveEnd}
          >
            <div className={cx(css.boxLegends, {[css.isMoving]: isMoving})}>
              <BoxLegends
                activeMode={activeMode}
                variables={variables.map(variable =>
                  _.pick(variable, ['id', 'component', 'property']),
                )}
                colors={colors.map(c => c.normal)}
                activeVariableId={activeVariableId}
                setActiveVariable={this.setActiveVariable}
                splitVariable={splitVariable}
                boxIndex={boxIndex}
              />
            </div>
          </DraggableArea>
          <div className={css.boxView} onWheel={this._handleResizeOnPinch}>
            <Broadcast
              channel={SelectionBoundariesChannel}
              value={selectionBoundaries}
            >
              <BoxView
                variables={variables}
                variableIds={props.variableIds}
                activeVariableId={activeVariableId}
                svgHeight={svgHeight}
                svgWidth={props.svgWidth}
                duration={props.duration}
                activeMode={activeMode}
                pathToVariables={props.pathToVariables}
                scrollLeft={props.scrollLeft}
                addPointToSelection={this.addPointToSelection}
                removePointFromSelection={this.removePointFromSelection}
              />
            </Broadcast>
          </div>
          {!shouldDisableResizeHandle && (
            <DraggableArea onDrag={this.onResize} onDragEnd={this.onResizeEnd}>
              <div className={css.resizeHandle} />
            </DraggableArea>
          )}
        </div>
      </div>
    )
  }
}

export default connect((s: ITheaterStoreState, op: IOwnProps) => {
  const pathToVariables = [...op.pathToTimeline, 'variables']
  const variablesState = _.get(s, pathToVariables)

  const variables = op.variableIds.map(id => variablesState[id])
  return {
    variables,
    pathToVariables,
  }
})(VariablesBox)

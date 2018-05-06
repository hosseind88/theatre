import {reduceStateAction} from '$shared/utils/redux/commonActions'
import StudioComponent from '$theater/handy/StudioComponent'
import React from 'react'
import connect from '$theater/handy/connect'

import * as css from './Input.css'
import {get} from 'lodash'
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
import {PanelActiveModeChannel} from '$theater/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import {MODES} from '$studio/common/components/ActiveModeDetector/ActiveModeDetector'
import {IStudioStoreState} from '$studio/types'
import resolveCss from '$shared/utils/resolveCss'

interface IOwnProps {
  prop: string
  pathToModifierInstantiationDescriptor: string[]
}

interface IProps extends IOwnProps {
  css?: any
  label: string
  value: undefined | number
  pathToProp: string[]
}

interface IState {
  isBeingDragged: boolean
  move: {x: number; y: number}
  initialPos: {x: number; y: number}
}

export class Input extends StudioComponent<IProps, IState> {
  state = {
    isBeingDragged: false,
    move: {x: 0, y: 0},
    initialPos: {x: 0, y: 0},
  }

  onChange = (e: React.ChangeEvent<{value: string}>) => {
    const value = e.target.value

    this.reduceState(this.props.pathToProp, o => {
      return value
    })
  }

  _handleDragStart(e) {
    this._addGlobalCursorRule()

    const {clientX: x, clientY: y} = e
    this.setState(() => ({isBeingDragged: true, initialPos: {x, y}}))

    this.dispatch(
      reduceStateAction(
        ['historicWorkspace', 'panels', 'panelObjectBeingDragged'],
        () => ({type: 'modifier', prop: this.props.prop}),
      ),
    )
  }

  _handleDragEnd() {
    this._removeGlobalCursorRule()
    this.setState(() => ({
      isBeingDragged: false,
      move: {x: 0, y: 0},
      initialPos: {x: 0, y: 0},
    }))

    this.dispatch(
      reduceStateAction(
        ['historicWorkspace', 'panels', 'panelObjectBeingDragged'],
        () => null,
      ),
    )
  }

  _addGlobalCursorRule() {
    document.body.classList.add('modifierInputDrag')
  }

  _removeGlobalCursorRule() {
    document.body.classList.remove('modifierInputDrag')
  }

  render() {
    const {props, state} = this
    const classes = resolveCss(css, props.css)
    const {label, value: rawValue} = props
    const {move, initialPos} = state

    const value = typeof rawValue === 'string' ? rawValue : ''

    return (
      <Subscriber channel={PanelActiveModeChannel}>
        {({activeMode}) => {
          return (
            <DraggableArea
              shouldRegisterEvents={activeMode === MODES.cmd}
              onDragStart={e => this._handleDragStart(e)}
              onDrag={(x, y) => this.setState(() => ({move: {x, y}}))}
              onDragEnd={() => this._handleDragEnd()}
            >
              <label {...classes('container')}>
                {/* <span {...classes('label')}>{label}</span> */}
                <input
                  ref={c => (this.input = c)}
                  {...classes('input')}
                  value={value}
                  onChange={this.onChange}
                  onKeyDown={e => (e.keyCode === 13 ? this.input.blur() : null)}
                  disabled={typeof rawValue === 'object'}
                />
                {state.isBeingDragged && (
                  <div
                    {...classes('draggable')}
                    style={{
                      transform: `translate3d(
                        ${initialPos.x + move.x}px,
                        ${initialPos.y + move.y}px,
                        0)`,
                    }}
                  >
                    {props.prop}
                  </div>
                )}
                {typeof rawValue === 'object' && (
                  <div {...classes('animated')}>Animated</div>
                )}
              </label>
            </DraggableArea>
          )
        }}
      </Subscriber>
    )
  }
}

export default connect((s: ITheaterStoreState, op: IOwnProps) => {
  const pathToProp = [
    ...op.pathToModifierInstantiationDescriptor,
    'props',
    op.prop,
  ]
  return {
    pathToProp,
    value: get(s, pathToProp),
  }
})(Input)

import React from 'react'
import ReactiveComponentWithTheater from '$theater/componentModel/react/utils/ReactiveComponentWithStudio'
import {val} from '$shared/DataVerse2/atom'
import * as css from './Viewports.css'
import resolveCss from '$shared/utils/resolveCss'
import {map} from 'lodash'
import Viewport from './Viewport'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import ActiveModeDetector, {
  ActiveMode,
} from '$studio/common/components/ActiveModeDetector/ActiveModeDetector'
import Container from '$studio/workspace/components/WhatToShowInBody/Viewports/Container'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class Viewports extends ReactiveComponentWithTheater<
  IProps,
  IState
> {
  _setNoViewportAsActive = () => {
    console.log('hi')

    this.dispatch(
      reduceHistoricState(
        ['historicWorkspace', 'viewports', 'activeViewportId'],
        () => undefined,
      ),
    )
  }

  _render() {
    // @todo use keys()
    const viewports = val(this.studioAtom2P.historicWorkspace.viewports.byId)

    return (
      <ActiveModeDetector modes={['option', 'cmd']}>
        {(activeMode: ActiveMode) => {
          return (
            <Container
              initialState={val(
                this.studioAtom2P.ahistoricWorkspace.viewportsContainer,
              )}
              dispatch={this.dispatch}
              activeMode={activeMode}
              classes={classes('container')}
            >
              {(scrollX: number, scrollY: number) => {
                return (
                  <>
                    <div
                      {...classes('viewports')}
                      style={{
                        left: scrollX,
                        top: scrollY,
                      }}
                    >
                      {map(viewports, s => {
                        return (
                          <Viewport
                            key={s.id}
                            id={s.id}
                            activeMode={activeMode}
                          />
                        )
                      })}
                    </div>
                    <div
                      {...classes('background')}
                      onClick={this._setNoViewportAsActive}
                    />
                  </>
                )
              }}
            </Container>
          )
        }}
      </ActiveModeDetector>
    )
  }
}

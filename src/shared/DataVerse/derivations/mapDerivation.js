// @flow
import AbstractDerivation from './AbstractDerivation'
import type {AbstractDerivation} from './types'

// type Deps<O> = $ObjMap<O, <V>(v: V) => AbstractDerivation<V>>

export class MapDerivation<T, V> extends AbstractDerivation
  implements AbstractDerivation<V> {
  getValue: () => V
  _fn: *
  _dep: AbstractDerivation<T>

  constructor(dep: AbstractDerivation<T>, fn: T => V) {
    super()
    this._dep = dep
    this._fn = fn

    this._addDependency(dep)
  }

  _recalculate() {
    return this._fn(this._dep.getValue())
  }
}

export default function mapDerivation<V, T>(
  dep: AbstractDerivation<V>,
  fn: V => T,
): AbstractDerivation<T> {
  return new MapDerivation(dep, fn)
}

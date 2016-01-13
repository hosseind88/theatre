array = require 'utila/lib/array'

module.exports = class _Emitter
  constructor: ->
    @_listeners = {}
    @_listenersForAnyEvent = []
    @_disabledEmitters = {}

  on: (eventName, listener) ->
    unless @_listeners[eventName]?
      @_listeners[eventName] = []

    @_listeners[eventName].push listener
    this

  onAnyEvent: (listener) ->
    @_listenersForAnyEvent.push listener
    this

  removeEvent: (eventName, listener) ->
    return @ unless @_listeners[eventName]?
    array.pluckOneItem @_listeners[eventName], listener
    this

  removeListeners: (eventName) ->
    return @ unless @_listeners[eventName]?
    @_listeners[eventName].length = 0
    this

  removeAllListeners: ->
    for name, listeners of @_listeners
      listeners.length = 0

    this

  _emit: (eventName, data) ->
    for listener in @_listenersForAnyEvent
      listener data, eventName

    return unless @_listeners[eventName]?

    for listener in @_listeners[eventName]
      listener data

    return

  # this makes sure that all the calls to this class's method 'fnName'
  # are throttled
  _throttleEmitterMethod: (fnName, time = 1000) ->
    originalFn = @[fnName]

    if typeof originalFn isnt 'function'
      throw Error "this class does not have a method called '#{fnName}'"

    lastCallArgs = null
    pending = no
    timer = null

    @[fnName] = =>
      lastCallArgs = arguments
      do pend

    pend = =>
      if pending
        clearTimeout timer
      timer = setTimeout runIt, time
      pending = yes

    runIt = =>
      pending = no
      originalFn.apply @, lastCallArgs

  _disableEmitter: (fnName) ->
    if @_disabledEmitters[fnName]?
      throw Error "#{fnName} is already a disabled emitter"

    @_disabledEmitters[fnName] = @[fnName]

    @[fnName] = ->

  _enableEmitter: (fnName) ->
    fn = @_disabledEmitters[fnName]

    unless fn?
      throw Error "#{fnName} is not a disabled emitter"

    @[fnName] = fn

    delete @_disabledEmitters[fnName]
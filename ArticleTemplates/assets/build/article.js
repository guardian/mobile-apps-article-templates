/*!
  * Bean - copyright (c) Jacob Thornton 2011-2012
  * https://github.com/fat/bean
  * MIT license
  */
(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define('bean',definition)
  else context[name] = definition()
})('bean', this, function (name, context) {
  name    = name    || 'bean'
  context = context || this

  var win            = window
    , old            = context[name]
    , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
    , nameRegex      = /\..*/
    , addEvent       = 'addEventListener'
    , removeEvent    = 'removeEventListener'
    , doc            = document || {}
    , root           = doc.documentElement || {}
    , W3C_MODEL      = root[addEvent]
    , eventSupport   = W3C_MODEL ? addEvent : 'attachEvent'
    , ONE            = {} // singleton for quick matching making add() do one()

    , slice          = Array.prototype.slice
    , str2arr        = function (s, d) { return s.split(d || ' ') }
    , isString       = function (o) { return typeof o == 'string' }
    , isFunction     = function (o) { return typeof o == 'function' }

      // events that we consider to be 'native', anything not in this list will
      // be treated as a custom event
    , standardNativeEvents =
        'click dblclick mouseup mousedown contextmenu '                  + // mouse buttons
        'mousewheel mousemultiwheel DOMMouseScroll '                     + // mouse wheel
        'mouseover mouseout mousemove selectstart selectend '            + // mouse movement
        'keydown keypress keyup '                                        + // keyboard
        'orientationchange '                                             + // mobile
        'focus blur change reset select submit '                         + // form elements
        'load unload beforeunload resize move DOMContentLoaded '         + // window
        'readystatechange message '                                      + // window
        'error abort scroll '                                              // misc
      // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
      // that doesn't actually exist, so make sure we only do these on newer browsers
    , w3cNativeEvents =
        'show '                                                          + // mouse buttons
        'input invalid '                                                 + // form elements
        'touchstart touchmove touchend touchcancel '                     + // touch
        'gesturestart gesturechange gestureend '                         + // gesture
        'textinput '                                                     + // TextEvent
        'readystatechange pageshow pagehide popstate '                   + // window
        'hashchange offline online '                                     + // window
        'afterprint beforeprint '                                        + // printing
        'dragstart dragenter dragover dragleave drag drop dragend '      + // dnd
        'loadstart progress suspend emptied stalled loadmetadata '       + // media
        'loadeddata canplay canplaythrough playing waiting seeking '     + // media
        'seeked ended durationchange timeupdate play pause ratechange '  + // media
        'volumechange cuechange '                                        + // media
        'checking noupdate downloading cached updateready obsolete '       // appcache

      // convert to a hash for quick lookups
    , nativeEvents = (function (hash, events, i) {
        for (i = 0; i < events.length; i++) events[i] && (hash[events[i]] = 1)
        return hash
      }({}, str2arr(standardNativeEvents + (W3C_MODEL ? w3cNativeEvents : ''))))

      // custom events are events that we *fake*, they are not provided natively but
      // we can use native events to generate them
    , customEvents = (function () {
        var isAncestor = 'compareDocumentPosition' in root
              ? function (element, container) {
                  return container.compareDocumentPosition && (container.compareDocumentPosition(element) & 16) === 16
                }
              : 'contains' in root
                ? function (element, container) {
                    container = container.nodeType === 9 || container === window ? root : container
                    return container !== element && container.contains(element)
                  }
                : function (element, container) {
                    while (element = element.parentNode) if (element === container) return 1
                    return 0
                  }
          , check = function (event) {
              var related = event.relatedTarget
              return !related
                ? related == null
                : (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString())
                    && !isAncestor(related, this))
            }

        return {
            mouseenter: { base: 'mouseover', condition: check }
          , mouseleave: { base: 'mouseout', condition: check }
          , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
        }
      }())

      // we provide a consistent Event object across browsers by taking the actual DOM
      // event object and generating a new one from its properties.
    , Event = (function () {
            // a whitelist of properties (for different event types) tells us what to check for and copy
        var commonProps  = str2arr('altKey attrChange attrName bubbles cancelable ctrlKey currentTarget ' +
              'detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey '  +
              'srcElement target timeStamp type view which propertyName')
          , mouseProps   = commonProps.concat(str2arr('button buttons clientX clientY dataTransfer '      +
              'fromElement offsetX offsetY pageX pageY screenX screenY toElement'))
          , mouseWheelProps = mouseProps.concat(str2arr('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ ' +
              'axis')) // 'axis' is FF specific
          , keyProps     = commonProps.concat(str2arr('char charCode key keyCode keyIdentifier '          +
              'keyLocation location'))
          , textProps    = commonProps.concat(str2arr('data'))
          , touchProps   = commonProps.concat(str2arr('touches targetTouches changedTouches scale rotation'))
          , messageProps = commonProps.concat(str2arr('data origin source'))
          , stateProps   = commonProps.concat(str2arr('state'))
          , overOutRegex = /over|out/
            // some event types need special handling and some need special properties, do that all here
          , typeFixers   = [
                { // key events
                    reg: /key/i
                  , fix: function (event, newEvent) {
                      newEvent.keyCode = event.keyCode || event.which
                      return keyProps
                    }
                }
              , { // mouse events
                    reg: /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i
                  , fix: function (event, newEvent, type) {
                      newEvent.rightClick = event.which === 3 || event.button === 2
                      newEvent.pos = { x: 0, y: 0 }
                      if (event.pageX || event.pageY) {
                        newEvent.clientX = event.pageX
                        newEvent.clientY = event.pageY
                      } else if (event.clientX || event.clientY) {
                        newEvent.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                        newEvent.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
                      }
                      if (overOutRegex.test(type)) {
                        newEvent.relatedTarget = event.relatedTarget
                          || event[(type == 'mouseover' ? 'from' : 'to') + 'Element']
                      }
                      return mouseProps
                    }
                }
              , { // mouse wheel events
                    reg: /mouse.*(wheel|scroll)/i
                  , fix: function () { return mouseWheelProps }
                }
              , { // TextEvent
                    reg: /^text/i
                  , fix: function () { return textProps }
                }
              , { // touch and gesture events
                    reg: /^touch|^gesture/i
                  , fix: function () { return touchProps }
                }
              , { // message events
                    reg: /^message$/i
                  , fix: function () { return messageProps }
                }
              , { // popstate events
                    reg: /^popstate$/i
                  , fix: function () { return stateProps }
                }
              , { // everything else
                    reg: /.*/
                  , fix: function () { return commonProps }
                }
            ]
          , typeFixerMap = {} // used to map event types to fixer functions (above), a basic cache mechanism

          , Event = function (event, element, isNative) {
              if (!arguments.length) return
              event = event || ((element.ownerDocument || element.document || element).parentWindow || win).event
              this.originalEvent = event
              this.isNative       = isNative
              this.isBean         = true

              if (!event) return

              var type   = event.type
                , target = event.target || event.srcElement
                , i, l, p, props, fixer

              this.target = target && target.nodeType === 3 ? target.parentNode : target

              if (isNative) { // we only need basic augmentation on custom events, the rest expensive & pointless
                fixer = typeFixerMap[type]
                if (!fixer) { // haven't encountered this event type before, map a fixer function for it
                  for (i = 0, l = typeFixers.length; i < l; i++) {
                    if (typeFixers[i].reg.test(type)) { // guaranteed to match at least one, last is .*
                      typeFixerMap[type] = fixer = typeFixers[i].fix
                      break
                    }
                  }
                }

                props = fixer(event, this, type)
                for (i = props.length; i--;) {
                  if (!((p = props[i]) in this) && p in event) this[p] = event[p]
                }
              }
            }

        // preventDefault() and stopPropagation() are a consistent interface to those functions
        // on the DOM, stop() is an alias for both of them together
        Event.prototype.preventDefault = function () {
          if (this.originalEvent.preventDefault) this.originalEvent.preventDefault()
          else this.originalEvent.returnValue = false
        }
        Event.prototype.stopPropagation = function () {
          if (this.originalEvent.stopPropagation) this.originalEvent.stopPropagation()
          else this.originalEvent.cancelBubble = true
        }
        Event.prototype.stop = function () {
          this.preventDefault()
          this.stopPropagation()
          this.stopped = true
        }
        // stopImmediatePropagation() has to be handled internally because we manage the event list for
        // each element
        // note that originalElement may be a Bean#Event object in some situations
        Event.prototype.stopImmediatePropagation = function () {
          if (this.originalEvent.stopImmediatePropagation) this.originalEvent.stopImmediatePropagation()
          this.isImmediatePropagationStopped = function () { return true }
        }
        Event.prototype.isImmediatePropagationStopped = function () {
          return this.originalEvent.isImmediatePropagationStopped && this.originalEvent.isImmediatePropagationStopped()
        }
        Event.prototype.clone = function (currentTarget) {
          //TODO: this is ripe for optimisation, new events are *expensive*
          // improving this will speed up delegated events
          var ne = new Event(this, this.element, this.isNative)
          ne.currentTarget = currentTarget
          return ne
        }

        return Event
      }())

      // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
    , targetElement = function (element, isNative) {
        return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
      }

      /**
        * Bean maintains an internal registry for event listeners. We don't touch elements, objects
        * or functions to identify them, instead we store everything in the registry.
        * Each event listener has a RegEntry object, we have one 'registry' for the whole instance.
        */
    , RegEntry = (function () {
        // each handler is wrapped so we can handle delegation and custom events
        var wrappedHandler = function (element, fn, condition, args) {
            var call = function (event, eargs) {
                  return fn.apply(element, args ? slice.call(eargs, event ? 0 : 1).concat(args) : eargs)
                }
              , findTarget = function (event, eventElement) {
                  return fn.__beanDel ? fn.__beanDel.ft(event.target, element) : eventElement
                }
              , handler = condition
                  ? function (event) {
                      var target = findTarget(event, this) // deleated event
                      if (condition.apply(target, arguments)) {
                        if (event) event.currentTarget = target
                        return call(event, arguments)
                      }
                    }
                  : function (event) {
                      if (fn.__beanDel) event = event.clone(findTarget(event)) // delegated event, fix the fix
                      return call(event, arguments)
                    }
            handler.__beanDel = fn.__beanDel
            return handler
          }

        , RegEntry = function (element, type, handler, original, namespaces, args, root) {
            var customType     = customEvents[type]
              , isNative

            if (type == 'unload') {
              // self clean-up
              handler = once(removeListener, element, type, handler, original)
            }

            if (customType) {
              if (customType.condition) {
                handler = wrappedHandler(element, handler, customType.condition, args)
              }
              type = customType.base || type
            }

            this.isNative      = isNative = nativeEvents[type] && !!element[eventSupport]
            this.customType    = !W3C_MODEL && !isNative && type
            this.element       = element
            this.type          = type
            this.original      = original
            this.namespaces    = namespaces
            this.eventType     = W3C_MODEL || isNative ? type : 'propertychange'
            this.target        = targetElement(element, isNative)
            this[eventSupport] = !!this.target[eventSupport]
            this.root          = root
            this.handler       = wrappedHandler(element, handler, null, args)
          }

        // given a list of namespaces, is our entry in any of them?
        RegEntry.prototype.inNamespaces = function (checkNamespaces) {
          var i, j, c = 0
          if (!checkNamespaces) return true
          if (!this.namespaces) return false
          for (i = checkNamespaces.length; i--;) {
            for (j = this.namespaces.length; j--;) {
              if (checkNamespaces[i] == this.namespaces[j]) c++
            }
          }
          return checkNamespaces.length === c
        }

        // match by element, original fn (opt), handler fn (opt)
        RegEntry.prototype.matches = function (checkElement, checkOriginal, checkHandler) {
          return this.element === checkElement &&
            (!checkOriginal || this.original === checkOriginal) &&
            (!checkHandler || this.handler === checkHandler)
        }

        return RegEntry
      }())

    , registry = (function () {
        // our map stores arrays by event type, just because it's better than storing
        // everything in a single array.
        // uses '$' as a prefix for the keys for safety and 'r' as a special prefix for
        // rootListeners so we can look them up fast
        var map = {}

          // generic functional search of our registry for matching listeners,
          // `fn` returns false to break out of the loop
          , forAll = function (element, type, original, handler, root, fn) {
              var pfx = root ? 'r' : '$'
              if (!type || type == '*') {
                // search the whole registry
                for (var t in map) {
                  if (t.charAt(0) == pfx) {
                    forAll(element, t.substr(1), original, handler, root, fn)
                  }
                }
              } else {
                var i = 0, l, list = map[pfx + type], all = element == '*'
                if (!list) return
                for (l = list.length; i < l; i++) {
                  if ((all || list[i].matches(element, original, handler)) && !fn(list[i], list, i, type)) return
                }
              }
            }

          , has = function (element, type, original, root) {
              // we're not using forAll here simply because it's a bit slower and this
              // needs to be fast
              var i, list = map[(root ? 'r' : '$') + type]
              if (list) {
                for (i = list.length; i--;) {
                  if (!list[i].root && list[i].matches(element, original, null)) return true
                }
              }
              return false
            }

          , get = function (element, type, original, root) {
              var entries = []
              forAll(element, type, original, null, root, function (entry) {
                return entries.push(entry)
              })
              return entries
            }

          , put = function (entry) {
              var has = !entry.root && !this.has(entry.element, entry.type, null, false)
                , key = (entry.root ? 'r' : '$') + entry.type
              ;(map[key] || (map[key] = [])).push(entry)
              return has
            }

          , del = function (entry) {
              forAll(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {
                list.splice(i, 1)
                entry.removed = true
                if (list.length === 0) delete map[(entry.root ? 'r' : '$') + entry.type]
                return false
              })
            }

            // dump all entries, used for onunload
          , entries = function () {
              var t, entries = []
              for (t in map) {
                if (t.charAt(0) == '$') entries = entries.concat(map[t])
              }
              return entries
            }

        return { has: has, get: get, put: put, del: del, entries: entries }
      }())

      // we need a selector engine for delegated events, use querySelectorAll if it exists
      // but for older browsers we need Qwery, Sizzle or similar
    , selectorEngine
    , setSelectorEngine = function (e) {
        if (!arguments.length) {
          selectorEngine = doc.querySelectorAll
            ? function (s, r) {
                return r.querySelectorAll(s)
              }
            : function () {
                throw new Error('Bean: No selector engine installed') // eeek
              }
        } else {
          selectorEngine = e
        }
      }

      // we attach this listener to each DOM event that we need to listen to, only once
      // per event type per DOM element
    , rootListener = function (event, type) {
        if (!W3C_MODEL && type && event && event.propertyName != '_on' + type) return

        var listeners = registry.get(this, type || event.type, null, false)
          , l = listeners.length
          , i = 0

        event = new Event(event, this, true)
        if (type) event.type = type

        // iterate through all handlers registered for this type, calling them unless they have
        // been removed by a previous handler or stopImmediatePropagation() has been called
        for (; i < l && !event.isImmediatePropagationStopped(); i++) {
          if (!listeners[i].removed) listeners[i].handler.call(this, event)
        }
      }

      // add and remove listeners to DOM elements
    , listener = W3C_MODEL
        ? function (element, type, add) {
            // new browsers
            element[add ? addEvent : removeEvent](type, rootListener, false)
          }
        : function (element, type, add, custom) {
            // IE8 and below, use attachEvent/detachEvent and we have to piggy-back propertychange events
            // to simulate event bubbling etc.
            var entry
            if (add) {
              registry.put(entry = new RegEntry(
                  element
                , custom || type
                , function (event) { // handler
                    rootListener.call(element, event, custom)
                  }
                , rootListener
                , null
                , null
                , true // is root
              ))
              if (custom && element['_on' + custom] == null) element['_on' + custom] = 0
              entry.target.attachEvent('on' + entry.eventType, entry.handler)
            } else {
              entry = registry.get(element, custom || type, rootListener, true)[0]
              if (entry) {
                entry.target.detachEvent('on' + entry.eventType, entry.handler)
                registry.del(entry)
              }
            }
          }

    , once = function (rm, element, type, fn, originalFn) {
        // wrap the handler in a handler that does a remove as well
        return function () {
          fn.apply(this, arguments)
          rm(element, type, originalFn)
        }
      }

    , removeListener = function (element, orgType, handler, namespaces) {
        var type     = orgType && orgType.replace(nameRegex, '')
          , handlers = registry.get(element, type, null, false)
          , removed  = {}
          , i, l

        for (i = 0, l = handlers.length; i < l; i++) {
          if ((!handler || handlers[i].original === handler) && handlers[i].inNamespaces(namespaces)) {
            // TODO: this is problematic, we have a registry.get() and registry.del() that
            // both do registry searches so we waste cycles doing this. Needs to be rolled into
            // a single registry.forAll(fn) that removes while finding, but the catch is that
            // we'll be splicing the arrays that we're iterating over. Needs extra tests to
            // make sure we don't screw it up. @rvagg
            registry.del(handlers[i])
            if (!removed[handlers[i].eventType] && handlers[i][eventSupport])
              removed[handlers[i].eventType] = { t: handlers[i].eventType, c: handlers[i].type }
          }
        }
        // check each type/element for removed listeners and remove the rootListener where it's no longer needed
        for (i in removed) {
          if (!registry.has(element, removed[i].t, null, false)) {
            // last listener of this type, remove the rootListener
            listener(element, removed[i].t, false, removed[i].c)
          }
        }
      }

      // set up a delegate helper using the given selector, wrap the handler function
    , delegate = function (selector, fn) {
        //TODO: findTarget (therefore $) is called twice, once for match and once for
        // setting e.currentTarget, fix this so it's only needed once
        var findTarget = function (target, root) {
              var i, array = isString(selector) ? selectorEngine(selector, root) : selector
              for (; target && target !== root; target = target.parentNode) {
                for (i = array.length; i--;) {
                  if (array[i] === target) return target
                }
              }
            }
          , handler = function (e) {
              var match = findTarget(e.target, this)
              if (match) fn.apply(match, arguments)
            }

        // __beanDel isn't pleasant but it's a private function, not exposed outside of Bean
        handler.__beanDel = {
            ft       : findTarget // attach it here for customEvents to use too
          , selector : selector
        }
        return handler
      }

    , fireListener = W3C_MODEL ? function (isNative, type, element) {
        // modern browsers, do a proper dispatchEvent()
        var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
        evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
        element.dispatchEvent(evt)
      } : function (isNative, type, element) {
        // old browser use onpropertychange, just increment a custom property to trigger the event
        element = targetElement(element, isNative)
        isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
      }

      /**
        * Public API: off(), on(), add(), (remove()), one(), fire(), clone()
        */

      /**
        * off(element[, eventType(s)[, handler ]])
        */
    , off = function (element, typeSpec, fn) {
        var isTypeStr = isString(typeSpec)
          , k, type, namespaces, i

        if (isTypeStr && typeSpec.indexOf(' ') > 0) {
          // off(el, 't1 t2 t3', fn) or off(el, 't1 t2 t3')
          typeSpec = str2arr(typeSpec)
          for (i = typeSpec.length; i--;)
            off(element, typeSpec[i], fn)
          return element
        }

        type = isTypeStr && typeSpec.replace(nameRegex, '')
        if (type && customEvents[type]) type = customEvents[type].base

        if (!typeSpec || isTypeStr) {
          // off(el) or off(el, t1.ns) or off(el, .ns) or off(el, .ns1.ns2.ns3)
          if (namespaces = isTypeStr && typeSpec.replace(namespaceRegex, '')) namespaces = str2arr(namespaces, '.')
          removeListener(element, type, fn, namespaces)
        } else if (isFunction(typeSpec)) {
          // off(el, fn)
          removeListener(element, null, typeSpec)
        } else {
          // off(el, { t1: fn1, t2, fn2 })
          for (k in typeSpec) {
            if (typeSpec.hasOwnProperty(k)) off(element, k, typeSpec[k])
          }
        }

        return element
      }

      /**
        * on(element, eventType(s)[, selector], handler[, args ])
        */
    , on = function(element, events, selector, fn) {
        var originalFn, type, types, i, args, entry, first

        //TODO: the undefined check means you can't pass an 'args' argument, fix this perhaps?
        if (selector === undefined && typeof events == 'object') {
          //TODO: this can't handle delegated events
          for (type in events) {
            if (events.hasOwnProperty(type)) {
              on.call(this, element, type, events[type])
            }
          }
          return
        }

        if (!isFunction(selector)) {
          // delegated event
          originalFn = fn
          args       = slice.call(arguments, 4)
          fn         = delegate(selector, originalFn, selectorEngine)
        } else {
          args       = slice.call(arguments, 3)
          fn         = originalFn = selector
        }

        types = str2arr(events)

        // special case for one(), wrap in a self-removing handler
        if (this === ONE) {
          fn = once(off, element, events, fn, originalFn)
        }

        for (i = types.length; i--;) {
          // add new handler to the registry and check if it's the first for this element/type
          first = registry.put(entry = new RegEntry(
              element
            , types[i].replace(nameRegex, '') // event type
            , fn
            , originalFn
            , str2arr(types[i].replace(namespaceRegex, ''), '.') // namespaces
            , args
            , false // not root
          ))
          if (entry[eventSupport] && first) {
            // first event of this type on this element, add root listener
            listener(element, entry.eventType, true, entry.customType)
          }
        }

        return element
      }

      /**
        * add(element[, selector], eventType(s), handler[, args ])
        *
        * Deprecated: kept (for now) for backward-compatibility
        */
    , add = function (element, events, fn, delfn) {
        return on.apply(
            null
          , !isString(fn)
              ? slice.call(arguments)
              : [ element, fn, events, delfn ].concat(arguments.length > 3 ? slice.call(arguments, 5) : [])
        )
      }

      /**
        * one(element, eventType(s)[, selector], handler[, args ])
        */
    , one = function () {
        return on.apply(ONE, arguments)
      }

      /**
        * fire(element, eventType(s)[, args ])
        *
        * The optional 'args' argument must be an array, if no 'args' argument is provided
        * then we can use the browser's DOM event system, otherwise we trigger handlers manually
        */
    , fire = function (element, type, args) {
        var types = str2arr(type)
          , i, j, l, names, handlers

        for (i = types.length; i--;) {
          type = types[i].replace(nameRegex, '')
          if (names = types[i].replace(namespaceRegex, '')) names = str2arr(names, '.')
          if (!names && !args && element[eventSupport]) {
            fireListener(nativeEvents[type], type, element)
          } else {
            // non-native event, either because of a namespace, arguments or a non DOM element
            // iterate over all listeners and manually 'fire'
            handlers = registry.get(element, type, null, false)
            args = [false].concat(args)
            for (j = 0, l = handlers.length; j < l; j++) {
              if (handlers[j].inNamespaces(names)) {
                handlers[j].handler.apply(element, args)
              }
            }
          }
        }
        return element
      }

      /**
        * clone(dstElement, srcElement[, eventType ])
        *
        * TODO: perhaps for consistency we should allow the same flexibility in type specifiers?
        */
    , clone = function (element, from, type) {
        var handlers = registry.get(from, type, null, false)
          , l = handlers.length
          , i = 0
          , args, beanDel

        for (; i < l; i++) {
          if (handlers[i].original) {
            args = [ element, handlers[i].type ]
            if (beanDel = handlers[i].handler.__beanDel) args.push(beanDel.selector)
            args.push(handlers[i].original)
            on.apply(null, args)
          }
        }
        return element
      }

    , bean = {
          'on'                : on
        , 'add'               : add
        , 'one'               : one
        , 'off'               : off
        , 'remove'            : off
        , 'clone'             : clone
        , 'fire'              : fire
        , 'Event'             : Event
        , 'setSelectorEngine' : setSelectorEngine
        , 'noConflict'        : function () {
            context[name] = old
            return this
          }
      }

  // for IE, clean up on unload to avoid leaks
  if (win.attachEvent) {
    var cleanup = function () {
      var i, entries = registry.entries()
      for (i in entries) {
        if (entries[i].type && entries[i].type !== 'unload') off(entries[i].element, entries[i].type)
      }
      win.detachEvent('onunload', cleanup)
      win.CollectGarbage && win.CollectGarbage()
    }
    win.attachEvent('onunload', cleanup)
  }

  // initialize selector engine to internal default (qSA or throw Error)
  setSelectorEngine()

  return bean
});

/*!
  * Bonzo: DOM Utility (c) Dustin Diaz 2012
  * https://github.com/ded/bonzo
  * License MIT
  */
(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define('bonzo',definition)
  else context[name] = definition()
})('bonzo', this, function() {
  var win = window
    , doc = win.document
    , html = doc.documentElement
    , parentNode = 'parentNode'
    , specialAttributes = /^(checked|value|selected|disabled)$/i
      // tags that we have trouble inserting *into*
    , specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i
    , simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/
    , table = ['<table>', '</table>', 1]
    , td = ['<table><tbody><tr>', '</tr></tbody></table>', 3]
    , option = ['<select>', '</select>', 1]
    , noscope = ['_', '', 0, 1]
    , tagMap = { // tags that we have trouble *inserting*
          thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
        , tr: ['<table><tbody>', '</tbody></table>', 2]
        , th: td , td: td
        , col: ['<table><colgroup>', '</colgroup></table>', 2]
        , fieldset: ['<form>', '</form>', 1]
        , legend: ['<form><fieldset>', '</fieldset></form>', 2]
        , option: option, optgroup: option
        , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
      }
    , stateAttributes = /^(checked|selected|disabled)$/
    , hasClass, addClass, removeClass
    , uidMap = {}
    , uuids = 0
    , digit = /^-?[\d\.]+$/
    , dattr = /^data-(.+)$/
    , px = 'px'
    , setAttribute = 'setAttribute'
    , getAttribute = 'getAttribute'
    , features = function() {
        var e = doc.createElement('p')
        return {
          transform: function () {
            var props = ['transform', 'webkitTransform', 'MozTransform', 'OTransform', 'msTransform'], i
            for (i = 0; i < props.length; i++) {
              if (props[i] in e.style) return props[i]
            }
          }()
        , classList: 'classList' in e
        }
      }()
    , whitespaceRegex = /\s+/
    , toString = String.prototype.toString
    , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, boxFlex: 1, WebkitBoxFlex: 1, MozBoxFlex: 1 }
    , query = doc.querySelectorAll && function (selector) { return doc.querySelectorAll(selector) }


  function getStyle(el, property) {
    var value = null
      , computed = doc.defaultView.getComputedStyle(el, '')
    computed && (value = computed[property])
    return el.style[property] || value
  }


  function isNode(node) {
    return node && node.nodeName && (node.nodeType == 1 || node.nodeType == 11)
  }


  function normalize(node, host, clone) {
    var i, l, ret
    if (typeof node == 'string') return bonzo.create(node)
    if (isNode(node)) node = [ node ]
    if (clone) {
      ret = [] // don't change original array
      for (i = 0, l = node.length; i < l; i++) ret[i] = cloneNode(host, node[i])
      return ret
    }
    return node
  }

  /**
   * @param {string} c a class name to test
   * @return {boolean}
   */
  function classReg(c) {
    return new RegExp('(^|\\s+)' + c + '(\\s+|$)')
  }


  /**
   * @param {Bonzo|Array} ar
   * @param {function(Object, number, (Bonzo|Array))} fn
   * @param {Object=} opt_scope
   * @param {boolean=} opt_rev
   * @return {Bonzo|Array}
   */
  function each(ar, fn, opt_scope, opt_rev) {
    var ind, i = 0, l = ar.length
    for (; i < l; i++) {
      ind = opt_rev ? ar.length - i - 1 : i
      fn.call(opt_scope || ar[ind], ar[ind], ind, ar)
    }
    return ar
  }


  /**
   * @param {Bonzo|Array} ar
   * @param {function(Object, number, (Bonzo|Array))} fn
   * @param {Object=} opt_scope
   * @return {Bonzo|Array}
   */
  function deepEach(ar, fn, opt_scope) {
    for (var i = 0, l = ar.length; i < l; i++) {
      if (isNode(ar[i])) {
        deepEach(ar[i].childNodes, fn, opt_scope)
        fn.call(opt_scope || ar[i], ar[i], i, ar)
      }
    }
    return ar
  }


  /**
   * @param {string} s
   * @return {string}
   */
  function camelize(s) {
    return s.replace(/-(.)/g, function (m, m1) {
      return m1.toUpperCase()
    })
  }


  /**
   * @param {string} s
   * @return {string}
   */
  function decamelize(s) {
    return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
  }


  /**
   * @param {Element} el
   * @return {*}
   */
  function data(el) {
    el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
    var uid = el[getAttribute]('data-node-uid')
    return uidMap[uid] || (uidMap[uid] = {})
  }


  /**
   * removes the data associated with an element
   * @param {Element} el
   */
  function clearData(el) {
    var uid = el[getAttribute]('data-node-uid')
    if (uid) delete uidMap[uid]
  }


  function dataValue(d) {
    var f
    try {
      return (d === null || d === undefined) ? undefined :
        d === 'true' ? true :
          d === 'false' ? false :
            d === 'null' ? null :
              (f = parseFloat(d)) == d ? f : d;
    } catch(e) {}
    return undefined
  }


  /**
   * @param {Bonzo|Array} ar
   * @param {function(Object, number, (Bonzo|Array))} fn
   * @param {Object=} opt_scope
   * @return {boolean} whether `some`thing was found
   */
  function some(ar, fn, opt_scope) {
    for (var i = 0, j = ar.length; i < j; ++i) if (fn.call(opt_scope || null, ar[i], i, ar)) return true
    return false
  }


  /**
   * this could be a giant enum of CSS properties
   * but in favor of file size sans-closure deadcode optimizations
   * we're just asking for any ol string
   * then it gets transformed into the appropriate style property for JS access
   * @param {string} p
   * @return {string}
   */
  function styleProperty(p) {
      (p == 'transform' && (p = features.transform)) ||
        (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + 'Origin'))
      return p ? camelize(p) : null
  }

  // this insert method is intense
  function insert(target, host, fn, rev) {
    var i = 0, self = host || this, r = []
      // target nodes could be a css selector if it's a string and a selector engine is present
      // otherwise, just use target
      , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
    // normalize each node in case it's still a string and we need to create nodes on the fly
    each(normalize(nodes), function (t, j) {
      each(self, function (el) {
        fn(t, r[i++] = j > 0 ? cloneNode(self, el) : el)
      }, null, rev)
    }, this, rev)
    self.length = i
    each(r, function (e) {
      self[--i] = e
    }, null, !rev)
    return self
  }


  /**
   * sets an element to an explicit x/y position on the page
   * @param {Element} el
   * @param {?number} x
   * @param {?number} y
   */
  function xy(el, x, y) {
    var $el = bonzo(el)
      , style = $el.css('position')
      , offset = $el.offset()
      , rel = 'relative'
      , isRel = style == rel
      , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]

    if (style == 'static') {
      $el.css('position', rel)
      style = rel
    }

    isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
    isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)

    x != null && (el.style.left = x - offset.left + delta[0] + px)
    y != null && (el.style.top = y - offset.top + delta[1] + px)

  }

  // classList support for class management
  // altho to be fair, the api sucks because it won't accept multiple classes at once
  if (features.classList) {
    hasClass = function (el, c) {
      return el.classList.contains(c)
    }
    addClass = function (el, c) {
      el.classList.add(c)
    }
    removeClass = function (el, c) {
      el.classList.remove(c)
    }
  }
  else {
    hasClass = function (el, c) {
      return classReg(c).test(el.className)
    }
    addClass = function (el, c) {
      el.className = (el.className + ' ' + c).trim()
    }
    removeClass = function (el, c) {
      el.className = (el.className.replace(classReg(c), ' ')).trim()
    }
  }


  /**
   * this allows method calling for setting values
   *
   * @example
   * bonzo(elements).css('color', function (el) {
   *   return el.getAttribute('data-original-color')
   * })
   *
   * @param {Element} el
   * @param {function (Element)|string} v
   * @return {string}
   */
  function setter(el, v) {
    return typeof v == 'function' ? v.call(el, el) : v
  }

  function scroll(x, y, type) {
    var el = this[0]
    if (!el) return this
    if (x == null && y == null) {
      return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
    }
    if (isBody(el)) {
      win.scrollTo(x, y)
    } else {
      x != null && (el.scrollLeft = x)
      y != null && (el.scrollTop = y)
    }
    return this
  }

  /**
   * @constructor
   * @param {Array.<Element>|Element|Node|string} elements
   */
  function Bonzo(elements) {
    this.length = 0
    if (elements) {
      elements = typeof elements !== 'string' &&
        !elements.nodeType &&
        typeof elements.length !== 'undefined' ?
          elements :
          [elements]
      this.length = elements.length
      for (var i = 0; i < elements.length; i++) this[i] = elements[i]
    }
  }

  Bonzo.prototype = {

      /**
       * @param {number} index
       * @return {Element|Node}
       */
      get: function (index) {
        return this[index] || null
      }

      // itetators
      /**
       * @param {function(Element|Node)} fn
       * @param {Object=} opt_scope
       * @return {Bonzo}
       */
    , each: function (fn, opt_scope) {
        return each(this, fn, opt_scope)
      }

      /**
       * @param {Function} fn
       * @param {Object=} opt_scope
       * @return {Bonzo}
       */
    , deepEach: function (fn, opt_scope) {
        return deepEach(this, fn, opt_scope)
      }


      /**
       * @param {Function} fn
       * @param {Function=} opt_reject
       * @return {Array}
       */
    , map: function (fn, opt_reject) {
        var m = [], n, i
        for (i = 0; i < this.length; i++) {
          n = fn.call(this, this[i], i)
          opt_reject ? (opt_reject(n) && m.push(n)) : m.push(n)
        }
        return m
      }

    // text and html inserters!

    /**
     * @param {string} h the HTML to insert
     * @param {boolean=} opt_text whether to set or get text content
     * @return {Bonzo|string}
     */
    , html: function (h, opt_text) {
        var method = opt_text
              ? 'textContent'
              : 'innerHTML'
          , that = this
          , append = function (el, i) {
              each(normalize(h, that, i), function (node) {
                el.appendChild(node)
              })
            }
          , updateElement = function (el, i) {
              try {
                if (opt_text || (typeof h == 'string' && !specialTags.test(el.tagName))) {
                  return el[method] = h
                }
              } catch (e) {}
              append(el, i)
            }
        return typeof h != 'undefined'
          ? this.empty().each(updateElement)
          : this[0] ? this[0][method] : ''
      }

      /**
       * @param {string=} opt_text the text to set, otherwise this is a getter
       * @return {Bonzo|string}
       */
    , text: function (opt_text) {
        return this.html(opt_text, true)
      }

      // more related insertion methods

      /**
       * @param {Bonzo|string|Element|Array} node
       * @return {Bonzo}
       */
    , append: function (node) {
        var that = this
        return this.each(function (el, i) {
          each(normalize(node, that, i), function (i) {
            el.appendChild(i)
          })
        })
      }


      /**
       * @param {Bonzo|string|Element|Array} node
       * @return {Bonzo}
       */
    , prepend: function (node) {
        var that = this
        return this.each(function (el, i) {
          var first = el.firstChild
          each(normalize(node, that, i), function (i) {
            el.insertBefore(i, first)
          })
        })
      }


      /**
       * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
       * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
       * @return {Bonzo}
       */
    , appendTo: function (target, opt_host) {
        return insert.call(this, target, opt_host, function (t, el) {
          t.appendChild(el)
        })
      }


      /**
       * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
       * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
       * @return {Bonzo}
       */
    , prependTo: function (target, opt_host) {
        return insert.call(this, target, opt_host, function (t, el) {
          t.insertBefore(el, t.firstChild)
        }, 1)
      }


      /**
       * @param {Bonzo|string|Element|Array} node
       * @return {Bonzo}
       */
    , before: function (node) {
        var that = this
        return this.each(function (el, i) {
          each(normalize(node, that, i), function (i) {
            el[parentNode].insertBefore(i, el)
          })
        })
      }


      /**
       * @param {Bonzo|string|Element|Array} node
       * @return {Bonzo}
       */
    , after: function (node) {
        var that = this
        return this.each(function (el, i) {
          each(normalize(node, that, i), function (i) {
            el[parentNode].insertBefore(i, el.nextSibling)
          }, null, 1)
        })
      }


      /**
       * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
       * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
       * @return {Bonzo}
       */
    , insertBefore: function (target, opt_host) {
        return insert.call(this, target, opt_host, function (t, el) {
          t[parentNode].insertBefore(el, t)
        })
      }


      /**
       * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
       * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
       * @return {Bonzo}
       */
    , insertAfter: function (target, opt_host) {
        return insert.call(this, target, opt_host, function (t, el) {
          var sibling = t.nextSibling
          sibling ?
            t[parentNode].insertBefore(el, sibling) :
            t[parentNode].appendChild(el)
        }, 1)
      }


      /**
       * @param {Bonzo|string|Element|Array} node
       * @return {Bonzo}
       */
    , replaceWith: function (node) {
        var that = this
        return this.each(function (el, i) {
          each(normalize(node, that, i), function (i) {
            el[parentNode] && el[parentNode].replaceChild(i, el)
          })
        })
      }

      /**
       * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
       * @return {Bonzo}
       */
    , clone: function (opt_host) {
        var ret = [] // don't change original array
          , l, i
        for (i = 0, l = this.length; i < l; i++) ret[i] = cloneNode(opt_host || this, this[i])
        return bonzo(ret)
      }

      // class management

      /**
       * @param {string} c
       * @return {Bonzo}
       */
    , addClass: function (c) {
        c = toString.call(c).split(whitespaceRegex)
        return this.each(function (el) {
          // we `each` here so you can do $el.addClass('foo bar')
          each(c, function (c) {
            if (c && !hasClass(el, setter(el, c)))
              addClass(el, setter(el, c))
          })
        })
      }


      /**
       * @param {string} c
       * @return {Bonzo}
       */
    , removeClass: function (c) {
        c = toString.call(c).split(whitespaceRegex)
        return this.each(function (el) {
          each(c, function (c) {
            if (c && hasClass(el, setter(el, c)))
              removeClass(el, setter(el, c))
          })
        })
      }


      /**
       * @param {string} c
       * @return {boolean}
       */
    , hasClass: function (c) {
        c = toString.call(c).split(whitespaceRegex)
        return some(this, function (el) {
          return some(c, function (c) {
            return c && hasClass(el, c)
          })
        })
      }


      /**
       * @param {string} c classname to toggle
       * @param {boolean=} opt_condition whether to add or remove the class straight away
       * @return {Bonzo}
       */
    , toggleClass: function (c, opt_condition) {
        c = toString.call(c).split(whitespaceRegex)
        return this.each(function (el) {
          each(c, function (c) {
            if (c) {
              typeof opt_condition !== 'undefined' ?
                opt_condition ? !hasClass(el, c) && addClass(el, c) : removeClass(el, c) :
                hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
            }
          })
        })
      }

      // display togglers

      /**
       * @param {string=} opt_type useful to set back to anything other than an empty string
       * @return {Bonzo}
       */
    , show: function (opt_type) {
        opt_type = typeof opt_type == 'string' ? opt_type : ''
        return this.each(function (el) {
          el.style.display = opt_type
        })
      }


      /**
       * @return {Bonzo}
       */
    , hide: function () {
        return this.each(function (el) {
          el.style.display = 'none'
        })
      }


      /**
       * @param {Function=} opt_callback
       * @param {string=} opt_type
       * @return {Bonzo}
       */
    , toggle: function (opt_callback, opt_type) {
        opt_type = typeof opt_type == 'string' ? opt_type : '';
        typeof opt_callback != 'function' && (opt_callback = null)
        return this.each(function (el) {
          el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : opt_type;
          opt_callback && opt_callback.call(el)
        })
      }


      // DOM Walkers & getters

      /**
       * @return {Element|Node}
       */
    , first: function () {
        return bonzo(this.length ? this[0] : [])
      }


      /**
       * @return {Element|Node}
       */
    , last: function () {
        return bonzo(this.length ? this[this.length - 1] : [])
      }


      /**
       * @return {Element|Node}
       */
    , next: function () {
        return this.related('nextSibling')
      }


      /**
       * @return {Element|Node}
       */
    , previous: function () {
        return this.related('previousSibling')
      }


      /**
       * @return {Element|Node}
       */
    , parent: function() {
        return this.related(parentNode)
      }


      /**
       * @private
       * @param {string} method the directional DOM method
       * @return {Element|Node}
       */
    , related: function (method) {
        return bonzo(this.map(
          function (el) {
            el = el[method]
            while (el && el.nodeType !== 1) {
              el = el[method]
            }
            return el || 0
          },
          function (el) {
            return el
          }
        ))
      }


      /**
       * @return {Bonzo}
       */
    , focus: function () {
        this.length && this[0].focus()
        return this
      }


      /**
       * @return {Bonzo}
       */
    , blur: function () {
        this.length && this[0].blur()
        return this
      }

      // style getter setter & related methods

      /**
       * @param {Object|string} o
       * @param {string=} opt_v
       * @return {Bonzo|string}
       */
    , css: function (o, opt_v) {
        var p, iter = o
        // is this a request for just getting a style?
        if (opt_v === undefined && typeof o == 'string') {
          // repurpose 'v'
          opt_v = this[0]
          if (!opt_v) return null
          if (opt_v === doc || opt_v === win) {
            p = (opt_v === doc) ? bonzo.doc() : bonzo.viewport()
            return o == 'width' ? p.width : o == 'height' ? p.height : ''
          }
          return (o = styleProperty(o)) ? getStyle(opt_v, o) : null
        }

        if (typeof o == 'string') {
          iter = {}
          iter[o] = opt_v
        }

        function fn(el, p, v) {
          for (var k in iter) {
            if (iter.hasOwnProperty(k)) {
              v = iter[k];
              // change "5" to "5px" - unless you're line-height, which is allowed
              (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
              try { el.style[p] = setter(el, v) } catch(e) {}
            }
          }
        }
        return this.each(fn)
      }


      /**
       * @param {number=} opt_x
       * @param {number=} opt_y
       * @return {Bonzo|number}
       */
    , offset: function (opt_x, opt_y) {
        if (opt_x && typeof opt_x == 'object' && (typeof opt_x.top == 'number' || typeof opt_x.left == 'number')) {
          return this.each(function (el) {
            xy(el, opt_x.left, opt_x.top)
          })
        } else if (typeof opt_x == 'number' || typeof opt_y == 'number') {
          return this.each(function (el) {
            xy(el, opt_x, opt_y)
          })
        }
        if (!this[0]) return {
            top: 0
          , left: 0
          , height: 0
          , width: 0
        }
        var el = this[0]
          , de = el.ownerDocument.documentElement
          , bcr = el.getBoundingClientRect()
          , scroll = getWindowScroll()
          , width = el.offsetWidth
          , height = el.offsetHeight
          , top = bcr.top + scroll.y - Math.max(0, de && de.clientTop, doc.body.clientTop)
          , left = bcr.left + scroll.x - Math.max(0, de && de.clientLeft, doc.body.clientLeft)

        return {
            top: top
          , left: left
          , height: height
          , width: width
        }
      }


      /**
       * @return {number}
       */
    , dim: function () {
        if (!this.length) return { height: 0, width: 0 }
        var el = this[0]
          , de = el.nodeType == 9 && el.documentElement // document
          , orig = !de && !!el.style && !el.offsetWidth && !el.offsetHeight ?
             // el isn't visible, can't be measured properly, so fix that
             function (t) {
               var s = {
                   position: el.style.position || ''
                 , visibility: el.style.visibility || ''
                 , display: el.style.display || ''
               }
               t.first().css({
                   position: 'absolute'
                 , visibility: 'hidden'
                 , display: 'block'
               })
               return s
            }(this) : null
          , width = de
              ? Math.max(el.body.scrollWidth, el.body.offsetWidth, de.scrollWidth, de.offsetWidth, de.clientWidth)
              : el.offsetWidth
          , height = de
              ? Math.max(el.body.scrollHeight, el.body.offsetHeight, de.scrollHeight, de.offsetHeight, de.clientHeight)
              : el.offsetHeight

        orig && this.first().css(orig)
        return {
            height: height
          , width: width
        }
      }

      // attributes are hard. go shopping

      /**
       * @param {string} k an attribute to get or set
       * @param {string=} opt_v the value to set
       * @return {Bonzo|string}
       */
    , attr: function (k, opt_v) {
        var el = this[0]
          , n

        if (typeof k != 'string' && !(k instanceof String)) {
          for (n in k) {
            k.hasOwnProperty(n) && this.attr(n, k[n])
          }
          return this
        }

        return typeof opt_v == 'undefined' ?
          !el ? null : specialAttributes.test(k) ?
            stateAttributes.test(k) && typeof el[k] == 'string' ?
              true : el[k] :  el[getAttribute](k) :
          this.each(function (el) {
            specialAttributes.test(k) ? (el[k] = setter(el, opt_v)) : el[setAttribute](k, setter(el, opt_v))
          })
      }


      /**
       * @param {string} k
       * @return {Bonzo}
       */
    , removeAttr: function (k) {
        return this.each(function (el) {
          stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
        })
      }


      /**
       * @param {string=} opt_s
       * @return {Bonzo|string}
       */
    , val: function (s) {
        return (typeof s == 'string' || typeof s == 'number') ?
          this.attr('value', s) :
          this.length ? this[0].value : null
      }

      // use with care and knowledge. this data() method uses data attributes on the DOM nodes
      // to do this differently costs a lot more code. c'est la vie
      /**
       * @param {string|Object=} opt_k the key for which to get or set data
       * @param {Object=} opt_v
       * @return {Bonzo|Object}
       */
    , data: function (opt_k, opt_v) {
        var el = this[0], o, m
        if (typeof opt_v === 'undefined') {
          if (!el) return null
          o = data(el)
          if (typeof opt_k === 'undefined') {
            each(el.attributes, function (a) {
              (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
            })
            return o
          } else {
            if (typeof o[opt_k] === 'undefined')
              o[opt_k] = dataValue(this.attr('data-' + decamelize(opt_k)))
            return o[opt_k]
          }
        } else {
          return this.each(function (el) { data(el)[opt_k] = opt_v })
        }
      }

      // DOM detachment & related

      /**
       * @return {Bonzo}
       */
    , remove: function () {
        this.deepEach(clearData)
        return this.detach()
      }


      /**
       * @return {Bonzo}
       */
    , empty: function () {
        return this.each(function (el) {
          deepEach(el.childNodes, clearData)

          while (el.firstChild) {
            el.removeChild(el.firstChild)
          }
        })
      }


      /**
       * @return {Bonzo}
       */
    , detach: function () {
        return this.each(function (el) {
          el[parentNode] && el[parentNode].removeChild(el)
        })
      }

      // who uses a mouse anyway? oh right.

      /**
       * @param {number} y
       */
    , scrollTop: function (y) {
        return scroll.call(this, null, y, 'y')
      }


      /**
       * @param {number} x
       */
    , scrollLeft: function (x) {
        return scroll.call(this, x, null, 'x')
      }

  }


  function cloneNode(host, el) {
    var c = el.cloneNode(true)
      , cloneElems
      , elElems
      , i

    // check for existence of an event cloner
    // preferably https://github.com/fat/bean
    // otherwise Bonzo won't do this for you
    if (host.$ && typeof host.cloneEvents == 'function') {
      host.$(c).cloneEvents(el)

      // clone events from every child node
      cloneElems = host.$(c).find('*')
      elElems = host.$(el).find('*')

      for (i = 0; i < elElems.length; i++)
        host.$(cloneElems[i]).cloneEvents(elElems[i])
    }
    return c
  }

  function isBody(element) {
    return element === win || (/^(?:body|html)$/i).test(element.tagName)
  }

  function getWindowScroll() {
    return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
  }

  function createScriptFromHtml(html) {
    var scriptEl = document.createElement('script')
      , matches = html.match(simpleScriptTagRe)
    scriptEl.src = matches[1]
    return scriptEl
  }

  /**
   * @param {Array.<Element>|Element|Node|string} els
   * @return {Bonzo}
   */
  function bonzo(els) {
    return new Bonzo(els)
  }

  bonzo.setQueryEngine = function (q) {
    query = q;
    delete bonzo.setQueryEngine
  }

  bonzo.aug = function (o, target) {
    // for those standalone bonzo users. this love is for you.
    for (var k in o) {
      o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
    }
  }

  bonzo.create = function (node) {
    // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
    return typeof node == 'string' && node !== '' ?
      function () {
        if (simpleScriptTagRe.test(node)) return [createScriptFromHtml(node)]
        var tag = node.match(/^\s*<([^\s>]+)/)
          , el = doc.createElement('div')
          , els = []
          , p = tag ? tagMap[tag[1].toLowerCase()] : null
          , dep = p ? p[2] + 1 : 1
          , ns = p && p[3]
          , pn = parentNode

        el.innerHTML = p ? (p[0] + node + p[1]) : node
        while (dep--) el = el.firstChild
        // for IE NoScope, we may insert cruft at the begining just to get it to work
        if (ns && el && el.nodeType !== 1) el = el.nextSibling
        do {
          if (!tag || el.nodeType == 1) {
            els.push(el)
          }
        } while (el = el.nextSibling)
        // IE < 9 gives us a parentNode which messes up insert() check for cloning
        // `dep` > 1 can also cause problems with the insert() check (must do this last)
        each(els, function(el) { el[pn] && el[pn].removeChild(el) })
        return els
      }() : isNode(node) ? [node.cloneNode(true)] : []
  }

  bonzo.doc = function () {
    var vp = bonzo.viewport()
    return {
        width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
      , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
    }
  }

  bonzo.firstChild = function (el) {
    for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
      if (c[i].nodeType === 1) e = c[j = i]
    }
    return e
  }

  bonzo.viewport = function () {
    return {
        width: win.innerWidth
      , height: win.innerHeight
    }
  }

  bonzo.isAncestor = 'compareDocumentPosition' in html ?
    function (container, element) {
      return (container.compareDocumentPosition(element) & 16) == 16
    } :
    function (container, element) {
      return container !== element && container.contains(element);
    }

  return bonzo
}); // the only line we care about using a semi-colon. placed here for concatenation tools
;
define('fence',[],function () {

    var fencedClass = 'fenced';
    var polyfilledClass = 'fenced-rendered';

    var resizeInit = 300; // milliseconds
    var resizeTimes = 12;

    // Run the callback multiple times in a loop, incrementing the
    // wait window using a fibonacci sequence
    function loop(callback, times, thisWait, lastWait) {
        lastWait = lastWait || 0;

        callback();

        if (times > 0) {
            // Schedule again and increase wait window
            setTimeout(function() {
                var nextWait = thisWait + lastWait;
                loop(callback, times - 1, nextWait, thisWait);
            }, thisWait);
        }
    }

    function done(el) {
        // We need to yield before starting this, for some reason
        setTimeout(function() {
            loop(function() {
                normalizeIframe(el);
                resizeIframe(el);
            }, resizeTimes, resizeInit);
        }, 0);
    }

    function replaceElement(elToRemove, elToInsert) {
        if (elToRemove.nextSibling) {
            elToRemove.parentNode.insertBefore(elToInsert, elToRemove.nextSibling);
        } else {
            elToRemove.parentNode.appendChild(elToInsert);
        }
        elToRemove.parentNode.removeChild(elToRemove);
    }

    function hasClass(element, className) {
        if (element.classList) {
            return element.classList.contains(className);
        } else {
            // Slightly more brittle...
            return element.className.indexOf(className) !== -1;
        }
    }

    function addClass(element, className) {
        if (element.classList) {
            return element.classList.add(className);
        } else {
            return element.className += ' ' + className;
        }
    }

    function renderAll() {
        // Get all embed iframes that have not been fully rendered yet.
        // TODO: backward compat?
        var selector = 'iframe.' + fencedClass;
        var iframes = document.querySelectorAll(selector);

        for (var i = 0, l = iframes.length; i < l; ++i) {
            render(iframes[i]);
        }
    }

    function render(iframe, options) {
        options = options || {};

        // Must only be run on <iframe>s with fenced class
        if (iframe.tagName !== 'IFRAME') {
            throw new Error('Cannot render non-iframe elements!');
        }
        if (! hasClass(iframe, fencedClass)) {
            throw new Error('Cannot render iframes with no ' + fencedClass + ' class!');
        }

        // if already polyfilled, nothing to be done (unless forced)
        var alreadyRendered = hasClass(iframe, polyfilledClass);
        if (alreadyRendered && ! options.force) {
            return;
        }

        // Reset iframe styling
        iframe.style.height = 0;
        iframe.frameBorder = 0;
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        iframe.width = '100%';

        var supportsSrcdoc = !!iframe.srcdoc;
        if (supportsSrcdoc) {
            // srcdoc is supported, add done listener (first time only)
            if (iframe.contentWindow.document.readyState === 'complete') {
                done(iframe);
            } else if (! alreadyRendered) {
                iframe.addEventListener('load', function() {
                    done(iframe);
                }, false);
            }
        } else {
            // If there's no srcdoc support write the src directly into the iframe.
            var src = iframe.getAttribute('srcdoc');
            if (src && typeof src === 'string') {
                iframe.contentWindow.contents = src;
                iframe.src = 'javascript:window["contents"]';
                done(iframe);
            }
        }

        addClass(iframe, polyfilledClass);
    }

    function normalizeIframe(iframe) {
        var doc = iframe.contentWindow && iframe.contentWindow.document;
        var body = doc && doc.body;
        if (body) {
            body.style.padding = 0;
            body.style.margin = 0;
            body.style.overflow = 'hidden';
        }
    }

    function resizeIframe(iframe) {
        var doc = iframe.contentWindow && iframe.contentWindow.document;
        if (doc) {
            var height = (doc.documentElement && doc.documentElement.scrollHeight) ||
                         (doc.body && doc.body.scrollHeight) || 0;
            iframe.style.height = height + 'px';
        }
    }

    function isSafeCode(html) {
        var holder = document.createElement('div');
        holder.innerHTML = (html || '').trim();
        var element = holder.firstChild;
        var isIframe = element && element.tagName === 'IFRAME';
        var singleChild = element && ! element.nextSibling;
        return isIframe && singleChild;
    }


    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function wrap(html) {
        if (isSafeCode(html)) {
            return html;
        } else {
            var escapedHtml = escapeHtml(html).replace(/\"/g, '&quot;');
            var htmlDoc = '<html><head></head><body>' +escapedHtml+ '</body></html>';
            return '<iframe srcdoc="' +htmlDoc+ '" class="' +fencedClass+ '"></iframe>';
        }
    }

    return {
        render: render,
        renderAll: renderAll,
        isSafeCode: isSafeCode,
        wrap: wrap
    };
});

;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define('fastClick',[],function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

/*!
 * smooth-scroll v7.1.1: Animate scrolling to anchor links
 * (c) 2015 Chris Ferdinandi
 * MIT License
 * http://github.com/cferdinandi/smooth-scroll
 */

(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define('smoothScroll',[], factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.smoothScroll = factory(root);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

	'use strict';

	//
	// Variables
	//

	var smoothScroll = {}; // Object for public APIs
	var supports = 'querySelector' in document && 'addEventListener' in root; // Feature test
	var settings, eventTimeout, fixedHeader, headerHeight;

	// Default settings
	var defaults = {
		selector: '[data-scroll]',
		selectorHeader: '[data-scroll-header]',
		speed: 500,
		easing: 'easeInOutCubic',
		offset: 0,
		updateURL: true,
		callback: function () {}
	};


	//
	// Methods
	//

	/**
	 * Merge two or more objects. Returns a new object.
	 * @private
	 * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
	 * @param {Object}   objects  The objects to merge together
	 * @returns {Object}          Merged values of defaults and options
	 */
	var extend = function () {

		// Variables
		var extended = {};
		var deep = false;
		var i = 0;
		var length = arguments.length;

		// Check if a deep merge
		if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
			deep = arguments[0];
			i++;
		}

		// Merge the object into the extended object
		var merge = function (obj) {
			for ( var prop in obj ) {
				if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
					// If deep merge and property is an object, merge properties
					if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
						extended[prop] = extend( true, extended[prop], obj[prop] );
					} else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		// Loop through each object and conduct a merge
		for ( ; i < length; i++ ) {
			var obj = arguments[i];
			merge(obj);
		}

		return extended;

	};

	/**
	 * Get the height of an element.
	 * @private
	 * @param  {Node} elem The element to get the height of
	 * @return {Number}    The element's height in pixels
	 */
	var getHeight = function ( elem ) {
		return Math.max( elem.scrollHeight, elem.offsetHeight, elem.clientHeight );
	};

	/**
	 * Get the closest matching element up the DOM tree.
	 * @private
	 * @param  {Element} elem     Starting element
	 * @param  {String}  selector Selector to match against (class, ID, data attribute, or tag)
	 * @return {Boolean|Element}  Returns null if not match found
	 */
	var getClosest = function ( elem, selector ) {

		// Variables
		var firstChar = selector.charAt(0);
		var supports = 'classList' in document.documentElement;
		var attribute, value;

		// If selector is a data attribute, split attribute from value
		if ( firstChar === '[' ) {
			selector = selector.substr(1, selector.length - 2);
			attribute = selector.split( '=' );

			if ( attribute.length > 1 ) {
				value = true;
				attribute[1] = attribute[1].replace( /"/g, '' ).replace( /'/g, '' );
			}
		}

		// Get closest match
		for ( ; elem && elem !== document; elem = elem.parentNode ) {

			// If selector is a class
			if ( firstChar === '.' ) {
				if ( supports ) {
					if ( elem.classList.contains( selector.substr(1) ) ) {
						return elem;
					}
				} else {
					if ( new RegExp('(^|\\s)' + selector.substr(1) + '(\\s|$)').test( elem.className ) ) {
						return elem;
					}
				}
			}

			// If selector is an ID
			if ( firstChar === '#' ) {
				if ( elem.id === selector.substr(1) ) {
					return elem;
				}
			}

			// If selector is a data attribute
			if ( firstChar === '[' ) {
				if ( elem.hasAttribute( attribute[0] ) ) {
					if ( value ) {
						if ( elem.getAttribute( attribute[0] ) === attribute[1] ) {
							return elem;
						}
					} else {
						return elem;
					}
				}
			}

			// If selector is a tag
			if ( elem.tagName.toLowerCase() === selector ) {
				return elem;
			}

		}

		return null;

	};

	/**
	 * Escape special characters for use with querySelector
	 * @private
	 * @param {String} id The anchor ID to escape
	 * @author Mathias Bynens
	 * @link https://github.com/mathiasbynens/CSS.escape
	 */
	var escapeCharacters = function ( id ) {
		var string = String(id);
		var length = string.length;
		var index = -1;
		var codeUnit;
		var result = '';
		var firstCodeUnit = string.charCodeAt(0);
		while (++index < length) {
			codeUnit = string.charCodeAt(index);
			// Note: there’s no need to special-case astral symbols, surrogate
			// pairs, or lone surrogates.

			// If the character is NULL (U+0000), then throw an
			// `InvalidCharacterError` exception and terminate these steps.
			if (codeUnit === 0x0000) {
				throw new InvalidCharacterError(
					'Invalid character: the input contains U+0000.'
				);
			}

			if (
				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
				// U+007F, […]
				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
				// If the character is the first character and is in the range [0-9]
				// (U+0030 to U+0039), […]
				(index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
				// If the character is the second character and is in the range [0-9]
				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
				(
					index === 1 &&
					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
					firstCodeUnit === 0x002D
				)
			) {
				// http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
				result += '\\' + codeUnit.toString(16) + ' ';
				continue;
			}

			// If the character is not handled by one of the above rules and is
			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
			// U+005A), or [a-z] (U+0061 to U+007A), […]
			if (
				codeUnit >= 0x0080 ||
				codeUnit === 0x002D ||
				codeUnit === 0x005F ||
				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
				codeUnit >= 0x0061 && codeUnit <= 0x007A
			) {
				// the character itself
				result += string.charAt(index);
				continue;
			}

			// Otherwise, the escaped character.
			// http://dev.w3.org/csswg/cssom/#escape-a-character
			result += '\\' + string.charAt(index);

		}
		return result;
	};

	/**
	 * Calculate the easing pattern
	 * @private
	 * @link https://gist.github.com/gre/1650294
	 * @param {String} type Easing pattern
	 * @param {Number} time Time animation should take to complete
	 * @returns {Number}
	 */
	var easingPattern = function ( type, time ) {
		var pattern;
		if ( type === 'easeInQuad' ) pattern = time * time; // accelerating from zero velocity
		if ( type === 'easeOutQuad' ) pattern = time * (2 - time); // decelerating to zero velocity
		if ( type === 'easeInOutQuad' ) pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; // acceleration until halfway, then deceleration
		if ( type === 'easeInCubic' ) pattern = time * time * time; // accelerating from zero velocity
		if ( type === 'easeOutCubic' ) pattern = (--time) * time * time + 1; // decelerating to zero velocity
		if ( type === 'easeInOutCubic' ) pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // acceleration until halfway, then deceleration
		if ( type === 'easeInQuart' ) pattern = time * time * time * time; // accelerating from zero velocity
		if ( type === 'easeOutQuart' ) pattern = 1 - (--time) * time * time * time; // decelerating to zero velocity
		if ( type === 'easeInOutQuart' ) pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time; // acceleration until halfway, then deceleration
		if ( type === 'easeInQuint' ) pattern = time * time * time * time * time; // accelerating from zero velocity
		if ( type === 'easeOutQuint' ) pattern = 1 + (--time) * time * time * time * time; // decelerating to zero velocity
		if ( type === 'easeInOutQuint' ) pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time; // acceleration until halfway, then deceleration
		return pattern || time; // no easing, no acceleration
	};

	/**
	 * Calculate how far to scroll
	 * @private
	 * @param {Element} anchor The anchor element to scroll to
	 * @param {Number} headerHeight Height of a fixed header, if any
	 * @param {Number} offset Number of pixels by which to offset scroll
	 * @returns {Number}
	 */
	var getEndLocation = function ( anchor, headerHeight, offset ) {
		var location = 0;
		if (anchor.offsetParent) {
			do {
				location += anchor.offsetTop;
				anchor = anchor.offsetParent;
			} while (anchor);
		}
		location = location - headerHeight - offset;
		return location >= 0 ? location : 0;
	};

	/**
	 * Determine the document's height
	 * @private
	 * @returns {Number}
	 */
	var getDocumentHeight = function () {
		return Math.max(
			root.document.body.scrollHeight, root.document.documentElement.scrollHeight,
			root.document.body.offsetHeight, root.document.documentElement.offsetHeight,
			root.document.body.clientHeight, root.document.documentElement.clientHeight
		);
	};

	/**
	 * Convert data-options attribute into an object of key/value pairs
	 * @private
	 * @param {String} options Link-specific options as a data attribute string
	 * @returns {Object}
	 */
	var getDataOptions = function ( options ) {
		return !options || !(typeof JSON === 'object' && typeof JSON.parse === 'function') ? {} : JSON.parse( options );
	};

	/**
	 * Update the URL
	 * @private
	 * @param {Element} anchor The element to scroll to
	 * @param {Boolean} url Whether or not to update the URL history
	 */
	var updateUrl = function ( anchor, url ) {
		if ( root.history.pushState && (url || url === 'true') && root.location.protocol !== 'file:' ) {
			root.history.pushState( null, null, [root.location.protocol, '//', root.location.host, root.location.pathname, root.location.search, anchor].join('') );
		}
	};

	var getHeaderHeight = function ( header ) {
		return header === null ? 0 : ( getHeight( header ) + header.offsetTop );
	};

	/**
	 * Start/stop the scrolling animation
	 * @public
	 * @param {Element} toggle The element that toggled the scroll event
	 * @param {Element} anchor The element to scroll to
	 * @param {Object} options
	 */
	smoothScroll.animateScroll = function ( toggle, anchor, options ) {

		// Options and overrides
		var overrides = getDataOptions( toggle ? toggle.getAttribute('data-options') : null );
		var settings = extend( settings || defaults, options || {}, overrides ); // Merge user options with defaults
		anchor = '#' + escapeCharacters(anchor.substr(1)); // Escape special characters and leading numbers

		// Selectors and variables
		var anchorElem = anchor === '#' ? root.document.documentElement : root.document.querySelector(anchor);
		var startLocation = root.pageYOffset; // Current location on the page
		if ( !fixedHeader ) { fixedHeader = root.document.querySelector( settings.selectorHeader ); }  // Get the fixed header if not already set
		if ( !headerHeight ) { headerHeight = getHeaderHeight( fixedHeader ); } // Get the height of a fixed header if one exists and not already set
		var endLocation = getEndLocation( anchorElem, headerHeight, parseInt(settings.offset, 10) ); // Scroll to location
		var animationInterval; // interval timer
		var distance = endLocation - startLocation; // distance to travel
		var documentHeight = getDocumentHeight();
		var timeLapsed = 0;
		var percentage, position;

		// Update URL
		updateUrl(anchor, settings.updateURL);

		/**
		 * Stop the scroll animation when it reaches its target (or the bottom/top of page)
		 * @private
		 * @param {Number} position Current position on the page
		 * @param {Number} endLocation Scroll to location
		 * @param {Number} animationInterval How much to scroll on this loop
		 */
		var stopAnimateScroll = function (position, endLocation, animationInterval) {
			var currentLocation = root.pageYOffset;
			if ( position == endLocation || currentLocation == endLocation || ( (root.innerHeight + currentLocation) >= documentHeight ) ) {
				clearInterval(animationInterval);
				anchorElem.focus();
				settings.callback( toggle, anchor ); // Run callbacks after animation complete
			}
		};

		/**
		 * Loop scrolling animation
		 * @private
		 */
		var loopAnimateScroll = function () {
			timeLapsed += 16;
			percentage = ( timeLapsed / parseInt(settings.speed, 10) );
			percentage = ( percentage > 1 ) ? 1 : percentage;
			position = startLocation + ( distance * easingPattern(settings.easing, percentage) );
			root.scrollTo( 0, Math.floor(position) );
			stopAnimateScroll(position, endLocation, animationInterval);
		};

		/**
		 * Set interval timer
		 * @private
		 */
		var startAnimateScroll = function () {
			animationInterval = setInterval(loopAnimateScroll, 16);
		};

		/**
		 * Reset position to fix weird iOS bug
		 * @link https://github.com/cferdinandi/smooth-scroll/issues/45
		 */
		if ( root.pageYOffset === 0 ) {
			root.scrollTo( 0, 0 );
		}

		// Start scrolling animation
		startAnimateScroll();

	};

	/**
	 * If smooth scroll element clicked, animate scroll
	 * @private
	 */
	var eventHandler = function (event) {
		var toggle = getClosest( event.target, settings.selector );
		if ( toggle && toggle.tagName.toLowerCase() === 'a' ) {
			event.preventDefault(); // Prevent default click event
			smoothScroll.animateScroll( toggle, toggle.hash, settings); // Animate scroll
		}
	};

	/**
	 * On window scroll and resize, only run events at a rate of 15fps for better performance
	 * @private
	 * @param  {Function} eventTimeout Timeout function
	 * @param  {Object} settings
	 */
	var eventThrottler = function (event) {
		if ( !eventTimeout ) {
			eventTimeout = setTimeout(function() {
				eventTimeout = null; // Reset timeout
				headerHeight = getHeaderHeight( fixedHeader ); // Get the height of a fixed header if one exists
			}, 66);
		}
	};

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	smoothScroll.destroy = function () {

		// If plugin isn't already initialized, stop
		if ( !settings ) return;

		// Remove event listeners
		root.document.removeEventListener( 'click', eventHandler, false );
		root.removeEventListener( 'resize', eventThrottler, false );

		// Reset varaibles
		settings = null;
		eventTimeout = null;
		fixedHeader = null;
		headerHeight = null;
	};

	/**
	 * Initialize Smooth Scroll
	 * @public
	 * @param {Object} options User settings
	 */
	smoothScroll.init = function ( options ) {

		// feature test
		if ( !supports ) return;

		// Destroy any existing initializations
		smoothScroll.destroy();

		// Selectors and variables
		settings = extend( defaults, options || {} ); // Merge user options with defaults
		fixedHeader = root.document.querySelector( settings.selectorHeader ); // Get the fixed header
		headerHeight = getHeaderHeight( fixedHeader );

		// When a toggle is clicked, run the click handler
		root.document.addEventListener('click', eventHandler, false );
		if ( fixedHeader ) { root.addEventListener( 'resize', eventThrottler, false ); }

	};


	//
	// Public APIs
	//

	return smoothScroll;

});

/**
 * flipsnap.js
 *
 * @version  0.6.3
 * @url http://hokaccha.github.com/js-flipsnap/
 *
 * Copyright 2011 PixelGrid, Inc.
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('flipSnap',[], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Flipsnap = factory();
  }
})(this, function() {

var div = document.createElement('div');
var prefix = ['webkit', 'moz', 'o', 'ms'];
var saveProp = {};
var support = Flipsnap.support = {};
var gestureStart = false;

var DISTANCE_THRESHOLD = 5;
var ANGLE_THREHOLD = 55;

support.transform3d = hasProp([
  'perspectiveProperty',
  'WebkitPerspective',
  'MozPerspective',
  'OPerspective',
  'msPerspective'
]);

support.transform = hasProp([
  'transformProperty',
  'WebkitTransform',
  'MozTransform',
  'OTransform',
  'msTransform'
]);

support.transition = hasProp([
  'transitionProperty',
  'WebkitTransitionProperty',
  'MozTransitionProperty',
  'OTransitionProperty',
  'msTransitionProperty'
]);

support.addEventListener = 'addEventListener' in window;
support.mspointer = window.navigator.msPointerEnabled;

support.cssAnimation = (support.transform3d || support.transform) && support.transition;

var eventTypes = ['touch', 'mouse'];
var events = {
  start: {
    touch: 'touchstart',
    mouse: 'mousedown'
  },
  move: {
    touch: 'touchmove',
    mouse: 'mousemove'
  },
  end: {
    touch: 'touchend',
    mouse: 'mouseup'
  },
  cancel: {
    touch: 'touchcancel'
  }
};

if (support.addEventListener) {
  document.addEventListener('gesturestart', function() {
    gestureStart = true;
  });

  document.addEventListener('gestureend', function() {
    gestureStart = false;
  });
}

function Flipsnap(element, opts) {
  return (this instanceof Flipsnap)
    ? this.init(element, opts)
    : new Flipsnap(element, opts);
}

Flipsnap.prototype.init = function(element, opts) {
  var self = this;

  // set element
  self.element = element;
  if (typeof element === 'string') {
    self.element = document.querySelector(element);
  }

  if (!self.element) {
    throw new Error('element not found');
  }

  if (support.mspointer) {
    self.element.style.msTouchAction = 'pan-y';
  }

  // set opts
  opts = opts || {};
  self.distance = opts.distance;
  self.maxPoint = opts.maxPoint;
  self.disableTouch = (opts.disableTouch === undefined) ? false : opts.disableTouch;
  self.disable3d = (opts.disable3d === undefined) ? false : opts.disable3d;
  self.transitionDuration = (opts.transitionDuration === undefined) ? '350ms' : opts.transitionDuration + 'ms';
  self.threshold = opts.threshold || 0;

  // set property
  self.currentPoint = 0;
  self.currentX = 0;
  self.animation = false;
  self.timerId = null;
  self.use3d = support.transform3d;
  if (self.disable3d === true) {
    self.use3d = false;
  }

  // set default style
  if (support.cssAnimation) {
    self._setStyle({
      transitionProperty: getCSSVal('transform'),
      transitionTimingFunction: 'cubic-bezier(0,0,0.25,1)',
      transitionDuration: '0ms',
      transform: self._getTranslate(0)
    });
  }
  else {
    self._setStyle({
      position: 'relative',
      left: '0px'
    });
  }

  // initilize
  self.refresh();

  eventTypes.forEach(function(type) {
    self.element.addEventListener(events.start[type], self, false);
  });

  return self;
};

Flipsnap.prototype.handleEvent = function(event) {
  var self = this;

  switch (event.type) {
    // start
    case events.start.touch: self._touchStart(event, 'touch'); break;
    case events.start.mouse: self._touchStart(event, 'mouse'); break;

    // move
    case events.move.touch: self._touchMove(event, 'touch'); break;
    case events.move.mouse: self._touchMove(event, 'mouse'); break;

    // end
    case events.end.touch: self._touchEnd(event, 'touch'); break;
    case events.end.mouse: self._touchEnd(event, 'mouse'); break;

    // handle touchcancel
    case events.cancel.touch: self._touchCancel(event, 'touch'); break;

    // click
    case 'click': self._click(event); break;
  }
};

Flipsnap.prototype.refresh = function() {
  var self = this;

  var parent = self.element.parentElement;
  var parentStyle = parent.currentStyle || window.getComputedStyle(parent);
  var parentInnerWidth = parent.offsetWidth - parseInt(parentStyle.paddingRight.replace('px','')) - parseInt(parentStyle.paddingLeft.replace('px',''));
  self._maxX = (self.element.scrollWidth - parentInnerWidth) * -1;
  
  var child = self.element.children[0];
  var childStyle = child.currentStyle || window.getComputedStyle(child);
  self._distance = parseInt(childStyle.marginRight.replace('px','')) + child.offsetWidth;

  // setting max point
  self._maxPoint = (self.maxPoint === undefined) ? (function() {
    var childNodes = self.element.childNodes,
      itemLength = -1,
      i = 0,
      len = childNodes.length,
      node;
    for(; i < len; i++) {
      node = childNodes[i];
      if (node.nodeType === 1) {
        itemLength++;
      }
    }

    return itemLength;
  })() : self.maxPoint;

  self.moveToPoint();
};

Flipsnap.prototype.moveToPoint = function(point, transitionDuration) {
  var self = this;
  
  transitionDuration = transitionDuration === undefined
    ? self.transitionDuration : transitionDuration + 'ms';

  var beforePoint = self.currentPoint;

  // not called from `refresh()`
  if (point === undefined) {
    point = self.currentPoint;
  }

  if (point < 0) {
    self.currentPoint = 0;
  }
  else if (point > self._maxPoint) {
    self.currentPoint = self._maxPoint;
  }
  else {
    self.currentPoint = parseInt(point, 10);
  }

  if (support.cssAnimation) {
    self._setStyle({ transitionDuration: transitionDuration });
  }
  else {
    self.animation = true;
  }

  var newX = - self.currentPoint * self._distance;

  if (newX < self._maxX) {
    newX = self._maxX;
  }
  self._setX(newX, transitionDuration);

  if (beforePoint !== self.currentPoint) { // is move?
    // `fsmoveend` is deprecated
    // `fspointmove` is recommend.
    self._triggerEvent('fsmoveend', true, false);
    self._triggerEvent('fspointmove', true, false);
  }
};

Flipsnap.prototype._setX = function(x, transitionDuration) {
  var self = this;

  self.currentX = x;
  if (support.cssAnimation) {
    self.element.style[ saveProp.transform ] = self._getTranslate(x);
  }
  else {
    if (self.animation) {
      self._animate(x, transitionDuration || self.transitionDuration);
    }
    else {
      self.element.style.left = x + 'px';
    }
  }
};

Flipsnap.prototype._touchStart = function(event, type) {
  var self = this;

  if (self.disableTouch || self.scrolling || gestureStart) {
    return;
  }

  self.element.addEventListener(events.move[type], self, false);
  document.addEventListener(events.end[type], self, false);

  var tagName = event.target.tagName;
  if (type === 'mouse' && tagName !== 'SELECT' && tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'BUTTON') {
    event.preventDefault();
  }

  if (support.cssAnimation) {
    self._setStyle({ transitionDuration: '0ms' });
  }
  else {
    self.animation = false;
  }
  self.scrolling = true;
  self.moveReady = false;
  self.startPageX = getPage(event, 'pageX');
  self.startPageY = getPage(event, 'pageY');
  self.basePageX = self.startPageX;
  self.directionX = 0;
  self.startTime = event.timeStamp;
  self._triggerEvent('fstouchstart', true, false);
};

Flipsnap.prototype._touchMove = function(event, type) {
  var self = this;

  if (!self.scrolling || gestureStart) {
    return;
  }

  var pageX = getPage(event, 'pageX');
  var pageY = getPage(event, 'pageY');
  var distX;
  var newX;

  if (self.moveReady) {
    event.preventDefault();

    distX = pageX - self.basePageX;
    newX = self.currentX + distX;
    if (newX >= 0 || newX < self._maxX) {
      newX = Math.round(self.currentX + distX / 3);
    }

    // When distX is 0, use one previous value.
    // For android firefox. When touchend fired, touchmove also
    // fired and distX is certainly set to 0. 
    self.directionX =
      distX === 0 ? self.directionX :
      distX > 0 ? -1 : 1;

    // if they prevent us then stop it
    var isPrevent = !self._triggerEvent('fstouchmove', true, true, {
      delta: distX,
      direction: self.directionX
    });

    if (isPrevent) {
      self._touchAfter({
        moved: false,
        originalPoint: self.currentPoint,
        newPoint: self.currentPoint,
        cancelled: true
      });
    } else {
      self._setX(newX);
    }
  }
  else {
    // https://github.com/hokaccha/js-flipsnap/pull/36
    var triangle = getTriangleSide(self.startPageX, self.startPageY, pageX, pageY);
    if (triangle.z > DISTANCE_THRESHOLD) {
      if (getAngle(triangle) > ANGLE_THREHOLD) {
        event.preventDefault();
        self.moveReady = true;
        self.element.addEventListener('click', self, true);
      }
      else {
        self.scrolling = false;
      }
    }
  }

  self.basePageX = pageX;
};

Flipsnap.prototype._touchEnd = function(event, type) {
  var self = this;

  self.element.removeEventListener(events.move[type], self, false);
  document.removeEventListener(events.end[type], self, false);

  if (!self.scrolling) {
    return;
  }

  var newPoint = -self.currentX / self._distance;
  newPoint =
    (self.directionX > 0) ? Math.ceil(newPoint) :
    (self.directionX < 0) ? Math.floor(newPoint) :
    Math.round(newPoint);

  if (newPoint < 0) {
    newPoint = 0;
  }
  else if (newPoint > self._maxPoint) {
    newPoint = self._maxPoint;
  }

  if (Math.abs(self.startPageX - self.basePageX) < self.threshold) {
    newPoint = self.currentPoint;
  }

  self._touchAfter({
    moved: newPoint !== self.currentPoint,
    originalPoint: self.currentPoint,
    newPoint: newPoint,
    cancelled: false
  });

  self.moveToPoint(newPoint);
};

Flipsnap.prototype._touchCancel = function(event, type) {
  event.stopPropagation();
  event.preventDefault();
};

Flipsnap.prototype._click = function(event) {
  var self = this;

  event.stopPropagation();
  event.preventDefault();
};

Flipsnap.prototype._touchAfter = function(params) {
  var self = this;

  self.scrolling = false;
  self.moveReady = false;

  setTimeout(function() {
    self.element.removeEventListener('click', self, true);
  }, 200);

  self._triggerEvent('fstouchend', true, false, params);
};

Flipsnap.prototype._setStyle = function(styles) {
  var self = this;
  var style = self.element.style;

  for (var prop in styles) {
    setStyle(style, prop, styles[prop]);
  }
};

Flipsnap.prototype._animate = function(x, transitionDuration) {
  var self = this;

  var elem = self.element;
  var begin = +new Date();
  var from = parseInt(elem.style.left, 10);
  var to = x;
  var duration = parseInt(transitionDuration, 10);
  var easing = function(time, duration) {
    return -(time /= duration) * (time - 2);
  };

  if (self.timerId) {
    clearInterval(self.timerId);
  }
  self.timerId = setInterval(function() {
    var time = new Date() - begin;
    var pos, now;
    if (time > duration) {
      clearInterval(self.timerId);
      self.timerId = null;
      now = to;
    }
    else {
      pos = easing(time, duration);
      now = pos * (to - from) + from;
    }
    elem.style.left = now + "px";
  }, 10);
};

Flipsnap.prototype.destroy = function() {
  var self = this;

  eventTypes.forEach(function(type) {
    self.element.removeEventListener(events.start[type], self, false);
  });
};

Flipsnap.prototype._getTranslate = function(x) {
  var self = this;

  return self.use3d
    ? 'translate3d(' + x + 'px, 0, 0)'
    : 'translate(' + x + 'px, 0)';
};

Flipsnap.prototype._triggerEvent = function(type, bubbles, cancelable, data) {
  var self = this;

  var ev = document.createEvent('Event');
  ev.initEvent(type, bubbles, cancelable);

  if (data) {
    for (var d in data) {
      if (data.hasOwnProperty(d)) {
        ev[d] = data[d];
      }
    }
  }

  return self.element.dispatchEvent(ev);
};

function getPage(event, page) {
  return event.changedTouches ? event.changedTouches[0][page] : event[page];
}

function hasProp(props) {
  return some(props, function(prop) {
    return div.style[ prop ] !== undefined;
  });
}

function setStyle(style, prop, val) {
  var _saveProp = saveProp[ prop ];
  if (_saveProp) {
    style[ _saveProp ] = val;
  }
  else if (style[ prop ] !== undefined) {
    saveProp[ prop ] = prop;
    style[ prop ] = val;
  }
  else {
    some(prefix, function(_prefix) {
      var _prop = ucFirst(_prefix) + ucFirst(prop);
      if (style[ _prop ] !== undefined) {
        saveProp[ prop ] = _prop;
        style[ _prop ] = val;
        return true;
      }
    });
  }
}

function getCSSVal(prop) {
  if (div.style[ prop ] !== undefined) {
    return prop;
  }
  else {
    var ret;
    some(prefix, function(_prefix) {
      var _prop = ucFirst(_prefix) + ucFirst(prop);
      if (div.style[ _prop ] !== undefined) {
        ret = '-' + _prefix + '-' + prop;
        return true;
      }
    });
    return ret;
  }
}

function ucFirst(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
}

function some(ary, callback) {
  for (var i = 0, len = ary.length; i < len; i++) {
    if (callback(ary[i], i)) {
      return true;
    }
  }
  return false;
}

function getTriangleSide(x1, y1, x2, y2) {
  var x = Math.abs(x1 - x2);
  var y = Math.abs(y1 - y2);
  var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

  return {
    x: x,
    y: y,
    z: z
  };
}

function getAngle(triangle) {
  var cos = triangle.y / triangle.z;
  var radian = Math.acos(cos);

  return 180 / (Math.PI / radian);
}

return Flipsnap;

});

/*!
  * @preserve Qwery - A selector engine
  * https://github.com/ded/qwery
  * (c) Dustin Diaz 2014 | License MIT
  */

(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define('qwery',definition)
  else context[name] = definition()
})('qwery', this, function () {

  var classOnly = /^\.([\w\-]+)$/
    , doc = document
    , win = window
    , html = doc.documentElement
    , nodeType = 'nodeType'
  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16
    } :
    function (element, container) {
      container = container == doc || container == window ? html : container
      return container !== element && container.contains(element)
    }

  function toArray(ar) {
    return [].slice.call(ar, 0)
  }

  function isNode(el) {
    var t
    return el && typeof el === 'object' && (t = el.nodeType) && (t == 1 || t == 9)
  }

  function arrayLike(o) {
    return (typeof o === 'object' && isFinite(o.length))
  }

  function flatten(ar) {
    for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
    return r
  }

  function uniq(ar) {
    var a = [], i, j
    label:
    for (i = 0; i < ar.length; i++) {
      for (j = 0; j < a.length; j++) {
        if (a[j] == ar[i]) {
          continue label
        }
      }
      a[a.length] = ar[i]
    }
    return a
  }


  function normalizeRoot(root) {
    if (!root) return doc
    if (typeof root == 'string') return qwery(root)[0]
    if (!root[nodeType] && arrayLike(root)) return root[0]
    return root
  }

  /**
   * @param {string|Array.<Element>|Element|Node} selector
   * @param {string|Array.<Element>|Element|Node=} opt_root
   * @return {Array.<Element>}
   */
  function qwery(selector, opt_root) {
    var m, root = normalizeRoot(opt_root)
    if (!root || !selector) return []
    if (selector === win || isNode(selector)) {
      return !opt_root || (selector !== win && isNode(root) && isAncestor(selector, root)) ? [selector] : []
    }
    if (selector && arrayLike(selector)) return flatten(selector)


    if (doc.getElementsByClassName && selector == 'string' && (m = selector.match(classOnly))) {
      return toArray((root).getElementsByClassName(m[1]))
    }
    // using duck typing for 'a' window or 'a' document (not 'the' window || document)
    if (selector && (selector.document || (selector.nodeType && selector.nodeType == 9))) {
      return !opt_root ? [selector] : []
    }
    return toArray((root).querySelectorAll(selector))
  }

  qwery.uniq = uniq

  return qwery
}, this);

/*global define */
define('modules/$',[
    'bonzo',
    'qwery'
], function (
    bonzo,
    qwery
) {
    'use strict';

    function $(selector, context) {
        return bonzo(qwery(selector, context));
    }

    return $;

});
/*global define */
define('modules/relativeDates',[
    'modules/$',
    'bonzo'
], function (
    $,
    bonzo
) {
    'use strict';

    function dayOfWeek(day) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    }

    function monthAbbr(month) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
    }

    function pad(n) {
        return n < 10 ? '0' + n : n;
    }

    function ampm(n) {
        return n < 12 ? 'am' : 'pm';
    }

    function twelveHourClock(hours) {
        return hours > 12 ? hours - 12 : hours;
    }

    function isToday(date) {
        var today = new Date();
        return (date.toDateString() === today.toDateString());
    }

    function isWithin24Hours(date) {
        var today = new Date();
        return (date.valueOf() > today.valueOf() - (24 * 60 * 60 * 1000));
    }

    function isWithinPastWeek(date) {
        var daysAgo = new Date().valueOf() - (7 * 24 * 60 * 60 * 1000);
        return date.valueOf() >= daysAgo;
    }

    function isWithinPastYear(date) {
        var weeksAgo = new Date().valueOf() - (52 * 7 * 24 * 60 * 60 * 1000);
        return date.valueOf() >= weeksAgo;
    }

    function isValidDate(date) {
        if (Object.prototype.toString.call(date) !== "[object Date]") {
            return false;
        }
        return !isNaN(date.getTime());
    }

    function withTime(date) {
        return ', ' + twelveHourClock(date.getHours()) + ':' + pad(date.getMinutes()) + ampm(date.getHours());
    }

    function makeRelativeDate(epoch, opts) {
        var then = new Date(Number(epoch)),
            now = new Date(),
            delta;

        opts = opts || {};

        if (!isValidDate(then)) {
            return false;
        }

        delta = parseInt((now.getTime() - then) / 1000, 10);

        if (delta < 0) {
            return false;

        } else if (delta < 55) {
            return delta + 's';

        } else if (delta < (55 * 60)) {
            var minutesAgo = Math.round(delta / 60, 10);
            if (minutesAgo == 1) {
                return 'Now';
            } else {
                return (minutesAgo) + 'm ago';
            }

        } else if (isToday(then) || (isWithin24Hours(then) && opts.format === 'short')) {
            var hoursAgo = Math.round(delta / 3600);
            return (hoursAgo) + 'h ago';

        } else if (isWithinPastWeek(then)) {
            var daysAgo = Math.round(delta / 3600 / 24);
            return (daysAgo) + 'd ago';

        } else if (isWithinPastYear(then)) {
            var weeksAgo = Math.round(delta / 3600 / 24 / 7);
            return (weeksAgo) + 'w ago';

        } else {
            var yearsAgo = Math.round(delta / 3600 / 24 / 7 / 52);
            return (yearsAgo) + 'y ago';
        }
    }

    function replaceValidTimestamps(selector, attr) {
        $(selector + '[' + attr + ']').each(function (el) {
            var $el = bonzo(el),
                datetime = new Date($el.attr(attr)),
                relativeDate = makeRelativeDate(datetime.getTime());

            if (relativeDate) {
                // If we find .timestamp__text (facia), use that instead
                var targetEl = $el[0].querySelector('.timestamp__text') || $el[0];

                if (!targetEl.getAttribute('title')) {
                    targetEl.setAttribute('title', bonzo(targetEl).text());
                }
                targetEl.innerHTML = relativeDate;
            }
        });
    }

    function init(selector, attr) {
        replaceValidTimestamps(selector, attr);
    }

    return {
        init: init
    };

});

/*global window,console,define */
define('modules/comments',[
    'bean',
    'bonzo',
    'modules/relativeDates',
    'modules/$'
], function (
    bean,
    bonzo,
    relativeDates,
    $
) {
    'use strict';

    var modules = {
            setupGlobals: function () {
                // Function that loops through comments, hides replies and enables interactivity for comments
                window.commentsReplyFormatting = function () {
                    var counter = 0;
                    var stopPropagation = 0;

                    $(".block--discussion-thread").each(function(el) {
                        if (!$(this).hasClass("block--discussion-thread--checked")) {
                            if (typeof $(this)[0].children[4] !== "undefined") {
                                var blockID = "div[id='" + $(this)[0].children[3].id + "']";
                                var numOfComments = $(this)[0].children.length - 4;
                                if (numOfComments == 1) {
                                    $(this).addClass("block--discussion-thread--orphan");
                                } else {
                                    $(blockID).after('<div class="more more--comments"><a class="more__label"><span class="more__icon" data-icon="&#xe050;" aria-hidden="true"></span><span class="more__text">' + numOfComments + ' more replies</span></a></div>');
                                }
                            }
                        }
                        $(this).addClass("block--discussion-thread--checked");

                        bean.on(el, 'click', '.more--comments', function () {
                            $(this).hide();
                            $(this).parent().addClass("expand");
                        });
                    });

                    $(".comment").each(function(el) {

                        bean.on(el, 'click', 'a, .more--comments, .comment__reply, .comment__recommend', function (event) {
                            stopPropagation = 1;
                        });

                        bean.on(el, 'click', '.comment__header, .comment__body', function (event) {
                            stopPropagation = 0;
                        });

                        bean.on(el, 'click', function () {
                            if (stopPropagation === 0) {
                                var block = $(el);
                                // If comment is replyable allow buttons
                                if (block.hasClass('visible')) {
                                    // Evaluate if this comment is open or not
                                    if (block.hasClass("comment--open")) {
                                        // Hide the buttons
                                        block.removeClass("comment--open");
                                    } else {
                                        // Hide previously opened block
                                        $(".comment--open").removeClass("comment--open");
                                        // Calculate height to animate initial comments
                                        var originalHeight = block[0].clientHeight;
                                        // 110px is the smallest height an initial comment can be with options expanded
                                        if (originalHeight > 85) {
                                            // 34 is the height of comment__options
                                            block.css("min-height", originalHeight + 34);
                                        } else {
                                            block.css("min-height", "85px");
                                        }
                                        // Add comment open class to show Reply and Report
                                        block.css("min-height", originalHeight);
                                        block.addClass('comment--open');
                                    }
                                }
                            }
                        });
                    });
                };
                // Global functions to handle comments, called by native code
                window.articleCommentsInserter = function (html) {
                    $('.comments__block--loading').hide();
                    if (!html) {
                        $('.comments__block--empty').show();
                    } else {
                        html = bonzo.create(html);
                        $(html).appendTo('.comments__container');
                        window.commentsReplyFormatting();
                    }
                };
                window.commentsInserter = function (html) {
                    if (!html) {
                        $('.comments__block--empty').show();
                        $('.comments__block--loading').hide();
                    } else {
                        html = bonzo.create(html);
                        $(html).appendTo($('.comments__container'));
                        window.commentsReplyFormatting();
                    }
                    $('.comments__block--loading').appendTo($('.comments__container'));
                };
                window.articleCommentsFailed = function () {
                    $('.comments__block--failed').show();
                    $('.comments__block--loading').hide();
                    $('.comments').addClass('comments-has-failed');
                };
                window.commentsFailed = function () {
                    $('.comments__block--loading').hide();
                    $('.comments__block--failed').show();
                    $('.comments').addClass('comments-has-failed');
                };
                window.commentsEnd = function () {
                    $('.comments__block--loading').remove();
                };
                window.commentsClosed = function () {
                    $(".comments, #discussion").addClass("comments--closed");
                };
                window.commentsOpen = function () {
                    $(".comments, #discussion").addClass("comments--open");
                };
                window.commentTime = function () {
                    relativeDates.init('.comment__timestamp', 'title');
                };

                // Functions for feedback on recommend buttons
                window.commentsRecommendIncrease = function (id, number) {
                    var target = 'div[id="' + id + '"] .comment__recommend';
                    $(target).addClass('increase');
                    $(target + ' .comment__recommend__count').text(number);
                };
                window.commentsRecommendDecrease = function (id, number) {
                    var target = 'div[id="' + id + '"] .comment__recommend';
                    $(target).removeClass('increase');
                    $(target + ' .comment__recommend__count').text(number);
                };
                window.applyNativeFunctionCall('articleCommentsInserter');
                window.applyNativeFunctionCall('commentsInserter');
                window.applyNativeFunctionCall('commentsFailed');
                window.applyNativeFunctionCall('commentsClosed');
                window.applyNativeFunctionCall('commentsOpen');
                window.applyNativeFunctionCall('articleCommentsFailed');
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.setupGlobals();
                window.commentTime();
                // console.info("Comments ready");
            }
        };

    return {
        init: ready,
        modules: modules
    };

});
/*global window,console,define */
define('modules/cards',[
    'bean',
    'bonzo',
    'flipSnap',
    'modules/$'
], function (
    bean,
    bonzo,
    flipSnap,
    $
) {
    'use strict';

    var modules = {
            setupGlobals: function () {
                // Global functions to handle related content, called by native code
                window.articleCardsInserter = function (html) {
                    if ($('.related-content').length) {
                        if (!html) {
                            modules.articleCardsFailed();
                        } else {
                            $('.related-content__wrapper').html(html);

                            // setup the snap to grid functionality 
                            modules.snapToGrid('.related-content__list');
                        }
                    }
                };

                window.articleCardsFailed = function(){
                    modules.articleCardsFailed();
                };

                window.applyNativeFunctionCall('articleCardsInserter');
                window.applyNativeFunctionCall('articleCardsFailed');
            },
            articleCardsFailed: function(){
                if ($('.related-content').length) {
                    $('.related-content').addClass('related-content--has-failed');
                }
            },
            snapToGrid: function(el) {
                // Setup now and re-init on resize or orientation change
                modules.setUpFlipSnap(el);
                bean.on(window, 'resize.cards orientationchange.cards', window.ThrottleDebounce.debounce(100, false, function () {
                    if (modules.flipSnap) {
                        modules.flipSnap.destroy();
                        $(el).removeAttr('style');
                    }
                    modules.setUpFlipSnap(el);
                }));
            },
            setUpFlipSnap: function(el) {
                modules.flipSnap = null;
                var list = $(el),
                    container = list.parent()[0],
                    containerStyle = container.currentStyle || window.getComputedStyle(container),
                    containerWidth = container.offsetWidth - parseInt(containerStyle.paddingRight.replace('px','')) - parseInt(containerStyle.paddingLeft.replace('px',''));

                // add a class with the number of child items, so we can set the widths based on that 
                list.addClass('related-content__list--items-' + list[0].childElementCount);

                // if the inner content is wider than the container set up the scrolling
                if (list[0].scrollWidth > containerWidth) {
                    modules.flipSnap = flipSnap(el);

                    // Android needs to be notified of touch start / touch end so article navigation can be 
                    // disabled / enabled when the using is scrolling through cards
                    if (bonzo(document.body).hasClass('android')) {
                        // Send true on touchstart
                        bean.on(document.body, 'touchstart.android', el, function() {
                            window.GuardianJSInterface.registerRelatedCardsTouch(true);
                        });
                        // Send false on touchend
                        bean.on(document.body, 'touchend.android', el, function() {
                            window.GuardianJSInterface.registerRelatedCardsTouch(false);
                        });
                    }
                }
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                if ($('.related-content__list').length) {
                    // Test pages will already have a list so just set the snap to grid
                    modules.snapToGrid('.related-content__list');
                } else {
                    // Article pages need to be set up 
                    modules.setupGlobals();
                }
            }
        };

    return {
        init: ready
    };

});
/*
 Module: more-tags.js
 Description: upgrades the 'Tags' list on content with a show more.
 */
define('modules/more-tags',[
    'modules/$',
    'bean',
    'bonzo'
], function (
    $,
    bean,
    bonzo
) {

    var SHOW_TAGS = 5;
    var modules = {
        refresh: function(){
            if($('.tags .inline-list .inline-list__item').length > SHOW_TAGS + 1){
                $(moreButton).insertAfter('.tags .inline-list .inline-list__item:nth-child('+ (SHOW_TAGS + 1) + ')');
                $('#more-tags-contaier ~ .inline-list__item').addClass('hide-tags');
            }
        },
        show: function(){            
            $(moreButton).hide();
            setTimeout(function(){ $('#more-tags-contaier ~ .hide-tags').removeClass('hide-tags'); }, 200);
        }
    };

    var moreButton = bonzo.create("<li id='more-tags-contaier' class='inline-list__item more-button js-more-button'><a id='more'>More...</a></li>").pop();
    bean.on(moreButton, 'click', modules.show);

    return modules;

});
define('modules/sharing',[
    'bean',
    'bonzo',
    'qwery',
    'modules/$'
], function (
    bean,
    bonzo,
    qwery,
    $
) {

    var modules = {
        nativeSharing: function(_window, service, url, title){
            var action;
            if(service === 'facebook'){
                action = 'x-gu://facebookshare/';
            }
            if(service === 'twitter'){
                action = 'x-gu://twittershare/';
            }

            if(action && url){
                action = action + "?url=" + encodeURIComponent(url);
                if(title){
                    action = action + "&title=" + encodeURIComponent(title);
                }
                _window.location.href = action;
            }
        }
    };

    function bootstrap(_window){
        if($('body').hasClass('ios')){
            _window.nativeSharing = modules.nativeSharing.bind(modules, _window);
        }
    }

    return {
        init: bootstrap,
        // testing purpouses
        modules: modules
    };
});

/*
 * throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){
    var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}
})(this);

//public function
window.ThrottleDebounce = Cowboy;

define("throttleDebounce", function(){});

/*global window,document,console,require,define,navigator */
define('bootstraps/common',[
    'bean',
    'bonzo',
    'fence',
    'fastClick',
    'smoothScroll',
    'flipSnap',
    'modules/comments',
    'modules/cards',
    'modules/more-tags',
    'modules/sharing',
    'throttleDebounce',
    'modules/$'
], function (
    bean,
    bonzo,
    fence,
    FastClick,
    smoothScroll,
    flipSnap,
    Comments,
    Cards,
    MoreTags,
    Sharing,
    throttleDebounce,
    $
) {
    'use strict';

    var modules = {
        attachFastClick: function () {
            // Polyfill to remove click delays on browsers with touch UIs
            FastClick.attach(document.body);
        },

        correctCaptions: function () {
            // Remove empty captions from figures
            $('figure').each(function (el) {
                var figcaption = $('figcaption', el);
                if (figcaption.length === 0 || figcaption.text() === '') {
                    figcaption.hide();
                }
            });
        },

        figcaptionToggle: function () {
            // Show/hides figure caption
            if ($('.main-media__caption__icon')[0]) {
                bean.on($('.main-media__caption__icon')[0], 'click touchend', window.ThrottleDebounce.debounce( 250, true, function () {
                    $('.main-media__caption__text').toggleClass('is-visible');
                }));
            }
        },

        loadComments: function () {
            Comments.init();
        },

        loadCards: function() {
            Cards.init();
        },

        loadInteractives: function () {
            // Boot interactives
            var offline = function(){
                $('figure.interactive:not(.interactive--offline)')
                    .addClass('interactive--offline')
                    .append(bonzo.create('<a class="interactive--offline--icon interactive--offline--icon--reload" href="#" onclick="window.loadInteractives(true);return false;"></a>'))
                    .append(bonzo.create('<a class="interactive--offline--icon interactive--offline--icon--loading"></a>'));
                $('figure.interactive.interactive--loading').removeClass('interactive--loading');
            };

            window.loadInteractives = function (force) {
                if((!$('body').hasClass('offline') || force) && navigator.onLine ){
                    $('figure.interactive').each(function (el) {
                        var bootUrl = el.getAttribute('data-interactive');
                        // The contract here is that the interactive module MUST return an object
                        // with a method called 'boot'.
                        require.undef(bootUrl);
                        $(el).addClass('interactive--loading');
                        require([bootUrl], function (interactive) {
                            // We pass the standard context and config here, but also inject the
                            // mediator so the external interactive can respond to our events.
                            if(interactive && interactive.boot){
                                $(el).removeClass('interactive--offline');
                                interactive.boot(el, document.body);
                            }
                        }, offline);
                    });
                } else {
                    offline();
                }
            };

            window.loadInteractives();
        },

        loadEmbeds: function() {

            window.loadEmbeds = function () {

                // Fix Wine Width
                modules.fixVineWidth();

                // Boot Fenced Embeds
                require(['fence'], function(fence) {
                    $("iframe.fenced").each(function(node) {
                        fence.render(node);
                    });
                });

            };
            window.loadEmbeds();
        },

        scrollToAnchor: function () {
            smoothScroll.init();
        },

        imageSizer: function () {
            // Resize figures to fit images
            window.articleImageSizer = function () {
                var figure,
                    isThumbnail,
                    hasCaption,
                    imageOrLinkedImage,
                    imageWrapper,
                    caption,
                    hasCaptionIcon,
                    imageClass;

                $('figure.element-image').each(function (el) {
                    figure = $(el);
                    isThumbnail = figure.hasClass("element--thumbnail");
                    //needed for live blogs when this populates every time loading in more articles
                    hasCaptionIcon = el.getElementsByClassName('figure__caption__icon').length;
                    caption = el.getElementsByClassName('element-image__caption');
                    hasCaption = caption.length;
                    imageOrLinkedImage = bonzo.firstChild(el);
                    imageClass = isThumbnail && hasCaption ? 'figure--thumbnail-with-caption' : (isThumbnail ? 'figure--thumbnail' : 'figure-wide');

                    figure.addClass(imageClass);

                    if (imageOrLinkedImage && !$(imageOrLinkedImage).hasClass('figure__inner')) {
                       imageWrapper = document.createElement('div');
                       bonzo(imageWrapper).addClass('figure__inner').append(imageOrLinkedImage);
                       bonzo(el).prepend(imageWrapper);
                    }

                    if (hasCaption && !hasCaptionIcon) { 
                       bonzo(caption).prepend('<span data-icon="&#xe044;" class="figure__caption__icon" aria-hidden="true"></span>');
                    }

                });
                
            };
            window.articleImageSizer();
        },

        isThumbNailImageWithoutCaptionPresent: function(el){
            return el.getElementsByClassName('figure--thumbnail').length;
        },

        applyArticleContentTypeClasses: function(){
            var hasThumbnailsWithCaps,
                classArray;
        
            $(".prose").each(function(el){
                var element = $(el);
                classArray = [];
                hasThumbnailsWithCaps = modules.isThumbNailImageWithoutCaptionPresent(el);
                if (hasThumbnailsWithCaps) {
                    classArray.push('prose--has-thumbnails-without-caps');
                } 
                if (classArray.length) {
                    element.addClass(classArray.join(" ")); 
                }
            });
        },

        insertTags: function () {
            // Tag Function
            window.articleTagInserter = function (html) {
                setTimeout(modules.showMoreTags, 0);
                html = bonzo.create(html);
                $(html).appendTo('.tags .inline-list');
                MoreTags.refresh();
            };
            window.applyNativeFunctionCall('articleTagInserter');
        },

        videoPositioning: function () {
            window.videoPositioning = function () {
                var mainMedia = $('.video-URL');
                if (mainMedia) {
                    for (var i = mainMedia.length - 1; i >= 0; i--) {
                        var media = $(mainMedia[i]);
                        window.GuardianJSInterface.videoPosition(media.offset().left, media.offset().top, media.offset().width, media.attr('href'));
                    }
                }
                setTimeout(window.videoPositioningPoller, 500, document.body.offsetHeight);
            };
            window.videoPositioningPoller = function(pageHeight) {
                var newHeight = document.body.offsetHeight;
                if(pageHeight !== newHeight) {
                    window.videoPositioning();
                } else {
                    setTimeout(window.videoPositioningPoller, 500, newHeight);
                }  
            };
            window.applyNativeFunctionCall('videoPositioning');
        },

        offline: function() {
            // Function that gracefully fails when the device is offline
            if ($(document.body).hasClass('offline')) {
                $(".article img").each(function() {
                    var element = $(this);
                    var img = new Image();
                    img.onerror = function() {
                        if ($(element).parent().attr("class") == "element-image-inner") {
                            $(element).hide();
                        } else {
                            $(element).replaceWith('<div class="element-image-inner"></div>');
                        }
                    };
                    img.src = $(this).attr('src');
                });
            }
        },

        setupAlertSwitch: function () {
            // Global function to switch follow alerts, called by native code
            window.alertSwitch = function (following, followid) {
                var followObject = $('[data-follow-alert-id="' + followid + '"]');
                if (followObject.length) {
                    if (following == 1) {
                        if (followObject.hasClass('following') === false) {
                            followObject.addClass('following');
                        }
                    } else {
                        if (followObject.hasClass('following')) {
                            followObject.removeClass('following');
                        }
                    }
                }
            };
        },

        setupTellMeWhenSwitch: function () {
            // Global function to switch tell me when, called by native code
            window.tellMeWhenSwitch = function (added, followid) {
                var tellMeWhenLink = $('a.tell-me-when');
                if (tellMeWhenLink.length) {
                    if (added == 1) {
                        tellMeWhenLink.addClass('added');
                    } else {
                        tellMeWhenLink.removeClass('added');
                    }
                }
            };
        },

        setupFontSizing: function () {
            // Global function to resize font, called by native code
            window.fontResize = function (current, replacement) {
                $(document.body).removeClass(current).addClass(replacement);
                var replacementStr = replacement;
                var replacementInt = replacementStr.split("-");
                document.body.setAttribute("data-font-size", replacementInt[2]);
            };
        },

        setupOfflineSwitch: function() {
            // Function that allows templates to better handle offline, called by native code
            window.offlineSwitch = function () {
                $(document.body).addClass("offline");
            };
        },

        showTabs: function (root) {
            // Set up tab events, show only first child
            var tabContainer = $('.tabs');
            var tabs = $('a',tabContainer);

            tabs.each(function(tab,i) {
                if (i > 0) {
                    $(tab.getAttribute('href')).hide();
                }
            });

            if(tabContainer[0]){
                bean.on(tabContainer[0], 'click', 'a', function (e) {

                    e.preventDefault();
                    var tab = $(this);

                    if( tab.attr("aria-selected") !== 'true' ) {

                        var activeTab = $('[aria-selected="true"]', tabContainer);
                        var tabId = tab.attr("id");

                        $(activeTab.attr('href')).hide();
                        activeTab.attr("aria-selected", false);

                        $(tab.attr('href')).show();
                        tab.attr("aria-selected", true);

                        switch(tabId) {
                            case "football__tab--article":
                                root.location.href = 'x-gu://football_tab_report';
                                break;
                            case "football__tab--stats":
                                modules.setPieChartSize();
                                root.location.href = 'x-gu://football_tab_stats';
                                break;
                            case "football__tab--liveblog":
                                root.location.href = 'x-gu://football_tab_liveblog';
                                break;
                            case "cricket__tab--liveblog":
                                if (modules.isAndroid) {
                                    window.GuardianJSInterface.cricketTabChanged('overbyover');
                                }
                                break;
                            case "cricket__tab--stats":
                                if (modules.isAndroid) {
                                    window.GuardianJSInterface.cricketTabChanged('scorecard');
                                }
                                break;
                            default:
                                root.location.href = 'x-gu://football_tab_unknown';
                        }
                    }
                });
            }
        },

        setPieChartSize: function (){
            var piechart = $('.pie-chart');
            var parent = piechart.parent().offset();
            piechart.css({
                'width': parent.width,
                'height': parent.width
            });
        },

        fixVineWidth: function (container) {
            var iframes = $('iframe[srcdoc*="https://vine.co"]:not([data-vine-fixed])',container);
            iframes.each(function(iframe){
                var size = iframe.parentNode.clientWidth;
                var $iframe = $(iframe);
                var srcdoc = $iframe.attr('srcdoc');
                srcdoc = srcdoc.replace(/width="[\d]+"/,'width="' + size + '"');
                srcdoc = srcdoc.replace(/height="[\d]+"/,'height="' + size + '"');
                $iframe.attr('srcdoc', srcdoc);
                $iframe.attr('data-vine-fixed', true);
            });
        },

        setGlobalObject: function (root) {
            var pageId = $('body').attr('data-page-id');

            root.guardian = {
                config: {
                    page: {
                        pageId: pageId === '__PAGE_ID__' ? null : pageId
                    }
                }
            };

            return root.guardian;
        },

        fixSeries: function () {
            var series = $('.content__series-label.content__labels a');
            series.html('<span>' + series.text().split(/\s+/).join(' </span><span>') + ' </span>');

            var spans = $('span', series);
            var size = spans.length;
            var lineWidth = 0;
            var minLastLineWidth = 80; //px

            for(var x = size - 1; x >=0; x--){
                lineWidth = lineWidth + spans[x].offsetWidth;
                if( lineWidth > minLastLineWidth) {
                    if( Math.abs(spans[x].getBoundingClientRect().top - spans[size - 1].getBoundingClientRect().top) >= spans[x].offsetHeight ){
                        bonzo(spans[x]).before('</br>');
                    }
                    break;
                }
            }
        },

        getArticleHeight: function () {
            modules.articleHeight(function(height){
                window.GuardianJSInterface.getArticleHeightCallback(height);
            });
        },

        articleHeight: function(callback) {
            // We want standard, feature or comment -article-containers
            // They are only presents in articles
            var contentType = document.body.getAttribute('data-content-type');
            var height = 0;
            if (contentType === 'article') {
                var articleContainer = $('div[id$=-article-container]')[0];
                height = articleContainer.offsetHeight;
            }
            return callback(height);
        },

        formatThumbnailImages: function() {
            var i,
                isPortrait,
                thumbnailImage,
                thumbnailFigures = document.getElementsByClassName("element-image element--thumbnail");

            for (i = 0; i < thumbnailFigures.length; i++) {
                thumbnailImage = thumbnailFigures[i].getElementsByTagName("img")[0];
                isPortrait = parseInt(thumbnailImage.getAttribute("height"), 10) > parseInt(thumbnailImage.getAttribute("width"), 10);
                
                if (isPortrait) {
                    thumbnailFigures[i].classList.add("portrait-thumbnail");
                } else {
                    thumbnailFigures[i].classList.add("landscape-thumbnail");
                }
            }
        }
    },

    ready = function () {
        modules.isAndroid = $('body').hasClass('android');

        if (!this.initialised) {
            this.initialised = true;

            /*
             These methods apply to all templates, if any should
             only run for articles, move to the Article bootstrap.
            */
            
            modules.attachFastClick();
            modules.correctCaptions();
            modules.figcaptionToggle();
            modules.imageSizer();
            modules.applyArticleContentTypeClasses();
            modules.insertTags();
            modules.videoPositioning();
            modules.loadComments();
            modules.loadCards();
            modules.loadEmbeds();
            modules.scrollToAnchor();
            modules.loadInteractives();
            modules.offline();
            modules.setupOfflineSwitch();
            modules.setupAlertSwitch();
            modules.setupTellMeWhenSwitch();
            modules.setupFontSizing();
            modules.showTabs(window);
            modules.setGlobalObject(window);
            modules.fixSeries();
            modules.formatThumbnailImages();
            window.getArticleHeight = modules.getArticleHeight;
            window.applyNativeFunctionCall('getArticleHeight');
            Sharing.init(window);

            if (!document.body.classList.contains('no-ready')) {
                window.location.href = 'x-gu://ready';
            }

        }
    };

    return {
        init: ready,
        // export internal functions for testing purpouse
        modules: modules
    };
});
/*global twttr:false */

define('modules/twitter',[
    'bean',
    'bonzo',
    'qwery',
    'modules/$'
], function (
    bean,
    bonzo,
    qwery,
    $
) {
    var timeoutId;
    var body = qwery('.article__body');
    var isAndroid = $('body').hasClass('android');

    function bootstrap() {
        bean.on(window, 'scroll', function(){
            if(timeoutId){
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(enhanceTweets, 200);
        });
    }

    function enhanceTweets() {

        var scriptElement,
            tweetElements       = qwery('blockquote.js-tweet, blockquote.twitter-tweet'),
            widgetScript        = qwery('#twitter-widget'),
            viewportHeight      = bonzo.viewport().height,
            scrollTop           = bonzo(document.body).scrollTop(),
            bindedCallBack      = false,
            processedTweets     = 0,
            scriptLoaded        = typeof twttr !== 'undefined' && 'widgets' in twttr && 'load' in twttr.widgets;

        tweetElements.forEach(function (element) {
            var $el = bonzo(element);
            if (scriptLoaded && ((scrollTop + (viewportHeight * 2.5)) > $el.offset().top) && (scrollTop < ($el.offset().top + $el.offset().height))) {
                $(element).removeClass('js-tweet').addClass('twitter-tweet');
                processedTweets ++;
            } else if($(element).hasClass('twitter-tweet')) {
                $(element).removeClass('twitter-tweet').addClass('js-tweet');
            }
        });

        if (tweetElements.length > 0) {
            if (widgetScript.length === 0) {
                scriptElement = document.createElement('script');
                scriptElement.id = 'twitter-widget';
                scriptElement.async = true;
                scriptElement.src = 'https://platform.twitter.com/widgets.js';
                $(document.body).append(scriptElement);
            } else {
                if (scriptLoaded) {
                    if(!bindedCallBack){
                        twttr.events.bind('rendered', workaroundClicks);
                        twttr.events.bind('rendered', fixVineAutoplay);
                        bindedCallBack = true;
                    }
                    if(processedTweets){
                       twttr.widgets.load(body);
                    }
                }
            }
        }
    }

    function workaroundClicks(evt) {
        if(isAndroid){
            bean.on(evt.target.contentWindow.document, 'click', 'a', function(evt){
                var anchor = evt.currentTarget;
                window.open(anchor.getAttribute('href'));
                evt.stopImmediatePropagation();
                evt.preventDefault();
            });
        } else {
            $('a.web-intent', evt.target.contentWindow.document).removeClass('web-intent');
        }
    }

    function fixVineAutoplay(evt){
        if(!isAndroid && $('iframe[src^="https://vine.co"],iframe[src^="https://amp.twimg.com/amplify-web-player/prod/source.html?video_url"]', evt.target.contentWindow.document)[0]){
            $('.MediaCard', evt.target.contentWindow.document).remove();
            $(evt.target).removeAttr('height');
        }
    }

    return {
        init: bootstrap,
        enhanceTweets: enhanceTweets,
        // testing purpouses
        modules: {
            fixVineAutoplay: fixVineAutoplay
        }
    };
});

define('modules/witness',[], function () {

    var modules = {
        duplicate: function(){
            var witness = document.querySelector('.witness');
            if(witness){
                document.querySelector('.article__body').insertAdjacentHTML('afterend', '<div class="extras">' + witness.outerHTML + '</div>');
            }
        }
    };

    return {
        duplicate: modules.duplicate,
        modules: modules
    };
});
/*
 Module: outbrain.js
 Description: show promoted content by outbrain.
 */
define('modules/outbrain',[
    'modules/$'
], function (
    $
) {
    'use strict';

    var isAndroid = $('body').hasClass('android');
    var outbrain = $('.container__outbrain');

    var device = function() {
        var deviceType = document.body.getAttribute('data-ads-config');
        return deviceType;
    };

    function getSection () {
        var sections = ['politics', 'world', 'business', 'commentisfree'];
        var section = document.body.getAttribute('data-content-section');
        return section.toLowerCase().match('news') || sections.indexOf(section.toLowerCase()) > 0 ? 'sections' : 'all';
    }

    function load() {
        var contentUrl = $('.outbrainImage').attr('data-src');

        if (outbrain.length > 0 && contentUrl.length > 0) {
            outbrain.css('display', 'block');
                
            var widgetConfig = {},
                widgetCodeImage, widgetCodeText, scriptElement;
 
            if (device() === 'tablet') {
                $('.outbrainText').css('display', 'block');
                widgetConfig = {
                    image: {
                        sections: isAndroid ? 'AR_25' : 'AR_24',
                        all: isAndroid ? 'AR_19' : 'AR_18'
                    },
                    text: {
                        sections: isAndroid ? 'AR_26' : 'AR_27',
                        all: isAndroid ?'AR_21' : 'AR_20'
                    }
                };
                widgetCodeText = widgetConfig.text[getSection()];
                $('.outbrainText').attr('data-widget-id', widgetCodeText);
            } else if (device() ==='mobile') {
                widgetConfig = {
                    image: {
                        sections: isAndroid ? 'AR_23' : 'AR_22',
                        all: isAndroid ? 'AR_17' : 'AR_16'
                    }
                };

                var parentNode = document.getElementById('outbrain');
                var textNode = document.getElementsByClassName('outbrainText');
                if (parentNode.childElementCount > 0 && textNode.length > 0) {
                    parentNode.removeChild(textNode[0]);
                }
            }

            widgetCodeImage = widgetConfig.image[getSection()];
            $('.outbrainImage').attr('data-widget-id', widgetCodeImage);

            scriptElement = document.createElement('script');
            scriptElement.id = 'outbrain-widget';
            scriptElement.async = true;
            scriptElement.src = 'https://widgets.outbrain.com/outbrain.js';
            $(document.body).append(scriptElement);
        }
    }

    return {
        load: load
    };
});
/*global window,document,console,define */
define('modules/ads',[
    'modules/$',
    'bonzo'
], function (
    $,
    bonzo
) {
    'use strict';

    var tabletMpuId = 'advert-mpu-content',
        mobileMpuId = 'advert-mobile-mpu-content',

        modules = {
            insertAdPlaceholders: function (config) {
                var windowWidth = window.innerWidth,
                    counter = 0,
                    mpuId = '',
                    mpuHtml = '';

                $('.article__body > div > *:nth-child(-n+3)').each(function() {
                    var tagName = $(this)[0].tagName;

                    if (tagName == 'P' || 
                        tagName == 'H2' || 
                        tagName == 'BLOCKQUOTE' ||
                        (tagName == 'FIGURE' && $(this).hasClass('element-placeholder')) ||
                        $(this).hasClass('element-video')) {
                        counter++;
                    }
                });

                // With split screen now available on ios, tablets can now end up being displayed in the mobile format.
                // To overcome this decide mpu placement with css positioning instead of appending in different places
                if (config.adsConfig == 'tablet' && counter == 3) {
                    mpuId = tabletMpuId;
                } else if (config.adsConfig == 'mobile') {
                    mpuId = mobileMpuId;
                }

                if (mpuId !== '') {
                    mpuHtml = '<div class="advert-slot advert-slot--mpu">' +
                                    '<div class="advert-slot__label">' +
                                        'Advertisement' +
                                        '<a class="advert-slot__action" href="x-gu://subscribe">' +
                                            'Hide' +
                                            '<span data-icon="&#xe04F;"></span>' +
                                        '</a>' +
                                    '</div>' +
                                    '<div class="advert-slot__wrapper" id="advert-slot__wrapper">' +
                                    '<div class="advert-slot__wrapper__content" id="' + mpuId + '"></div>' +
                                    '</div>' +
                                '</div>';
                    // To mimic the correct positioning on full width tablet view, we will need an 
                    // empty div to pad out the text so we can position absolutely over it.
                    $('.article__body > div > :first-child').before('<div class="advert-slot advert-slot--placeholder"></div>');
                }

                var nrParagraph = ( parseInt(config.mpuAfterParagraphs, 10) || 6 ) - 1;
                $('.article__body > div > p:nth-of-type(' + nrParagraph + ') ~ p + p').first().before(mpuHtml);
            },

            // return the current MPU's position.
            // This function is an internal function which accepts a function
            // formatter(left, top, width, height)

            getMpuPos : function(formatter) {
                var r;
                var el = document.getElementById('advert-slot__wrapper');
                if (el) {
                    r = el.getBoundingClientRect();
                    if(r.width !== 0 && r.height !== 0){
                        return formatter(r.left + document.body.scrollLeft,
                            r.top+document.body.scrollTop, r.width, r.height);
                    }
                } else {
                    return null;
                }
            },

            getMpuPosJson : function() {
                return modules.getMpuPos(function(x, y, w, h) {
                    return '{"left":' + x + ', "top":' + y + ', "width":' + w +', "height":' + h + '}';
                });
            },
            getMpuPosCommaSeparated : function() {
                return modules.getMpuPos(function(x, y, w, h) {
                    return x + ',' + y;
                });
            },
            getMpuOffsetTop : function() {
                return modules.getMpuPos(function(x, y, w, h) {
                    return y;
                });
            },
            poller : function(interval, yPos, firstRun) {
                var newYPos = modules.getMpuOffsetTop();

                if(firstRun && this.isAndroid){
                    modules.updateAndroidPosition();
                }

                if(newYPos !== yPos){
                    if(this.isAndroid){
                        modules.updateAndroidPosition();
                    } else {
                        window.location.href = 'x-gu://ad_moved';
                    }
                }

                setTimeout(modules.poller.bind(modules, interval + 50, newYPos), interval);
            },

            updateMPUPosition: function(yPos) {
                if (!yPos) {
                    yPos = $('#advert-slot__wrapper').offset().top;
                }

                var newYPos = $('#advert-slot__wrapper').offset().top;

                if(newYPos !== yPos){
                    if(this.isAndroid){
                        modules.updateAndroidPosition();
                    } else {
                        window.location.href = 'x-gu://ad_moved';
                    }
                }

                return newYPos;
            },

            updateAndroidPosition : function() {
                modules.getMpuPos(function(x, y, w, h){
                    window.GuardianJSInterface.mpuAdsPosition(x, y, w, h);
                });
            },

            initMpuPoller: function(){
                modules.poller(1000,
                    modules.getMpuOffsetTop(),
                    true
                );
            },

            fireAdsReady: function(_window) {
                if (!$('body').hasClass('no-ready') && $('body').attr('data-use-ads-ready') === 'true') {
                    _window.location.href = 'x-gu://ads-ready';
                }
            }
        },

        ready = function (config) {
            modules.isAndroid = $('body').hasClass('android');

            if (!this.initialised) {
                this.initialised = true;

                if (config.adsEnabled == 'true' || (config.adsEnabled !== null && config.adsEnabled.match && config.adsEnabled.match(/mpu/))) {
                    modules.insertAdPlaceholders(config);
                    window.getMpuPosJson = modules.getMpuPosJson;
                    window.getMpuPosCommaSeparated = modules.getMpuPosCommaSeparated;
                    window.initMpuPoller = modules.initMpuPoller;
                    window.applyNativeFunctionCall('initMpuPoller');

                    if(!modules.isAndroid){
                        modules.initMpuPoller();
                    }
                }

                modules.fireAdsReady(window);
            }
        };

    return {
        init: ready,
        // for testing purposes
        modules: modules
    };

});

/*global window,console,define */
define('modules/quiz',[
    'bean',
    'bonzo',
    'modules/$',
    'smoothScroll',
    'modules/ads'
], function (
    bean,
    bonzo,
    $,
    smoothScroll,
    Ads
) {
    'use strict';

    var modules = {
        quizInit: function(quiz) {
            var $quiz = $(quiz);

            if (!$quiz.length) {
                return false;
            }

            // Do we have an MPU and is it below the quiz?
            var mpu = $('#advert-slot__wrapper'),
                moveMPU = false;

            if (mpu.length) {
                var mpuOffset = mpu.offset().top,
                    quizOffset = $quiz.offset().top;

                if (mpuOffset > quizOffset) {
                    moveMPU = true;
                }
            }

            // Update MPU position on animation
            var startTime = null,
                yPos = null;

            function checkMPU(timestamp) {
                if (!startTime) {
                    startTime = timestamp;
                }

                var progress = timestamp - startTime;
                
                var newYPos = Ads.modules.updateMPUPosition(yPos);
                yPos = newYPos;

                if (progress < 2000) {
                    window.requestAnimationFrame(checkMPU);
                }
            }

            // Store the answers and remove the answer elements
            var answers = $('.quiz__correct-answers').html().split(',');
            $('.quiz__correct-answers-title, .quiz__correct-answers').remove();

            // Store vars for scoring the quiz
            var numQuestions = answers.length,
                numAnswered = 0,
                score = 0,
                scoreMessages = {},
                longestMessageLength = 0,
                longestMessage;

            // Store the result messages
            $('.quiz__scores > li').each(function(){
                var $this = $(this),
                    message = $this.attr('data-title');

                // Add this message to the array
                scoreMessages[Math.max($this.attr('data-min-score'),0)] = message;
            });

            // Build up the quiz results panel
            $quiz.append('<div id="quiz-scores" class="quiz-scores"><p class="quiz-scores__score">' +
                '<span class="quiz-scores__correct"></span> / <span class="quiz-scores__questions">' +
                numQuestions + '</span></p><p class="quiz-scores__message"></p></div>');

            // Loop through every question and set up the answers and click events for it's answers
            $('.quiz__question').each(function(question, index) {
                // Wrap question in a div for styling
                var questionWrapper = document.createElement('div'),
                    questionAnswerList = question.querySelectorAll('.question__answers');
                $(questionWrapper).addClass('question__wrapper');
                question.insertBefore(questionWrapper, questionAnswerList[0]);

                // Does this question have an image (if tools stripped out empty image tags some of this would be unnecessary)
                var questionImg = question.querySelectorAll(':scope > img');
                if (questionImg.length) {
                    if ($(questionImg).attr('src') !== '') {
                        $(question).addClass('has-image');
                        $(questionImg).addClass('question__img');
                        $(questionWrapper).append(questionImg);
                    } else {
                        $(questionImg).remove();
                    }
                }

                // Does this question have text
                var questionText = question.querySelectorAll('.question__text');
                if (questionText.length) {
                    $(questionWrapper).append(questionText);
                }

                // This question's correct answer & response text
                var $correctAnswer,
                    $correctAnswerWrapper,
                    correctAnswerArray = answers[index].split(':')[1].split('-'),
                    correctAnswerCode = correctAnswerArray[0].trim().toUpperCase(),
                    correctAnswerExplanation = correctAnswerArray[1];

                // All the answers for this question
                var questionAnswers = this.querySelectorAll('.question__answer');

                // Loop through each answer and set up it's styling
                $(questionAnswers).each(function(answer, index) {
                    // Wrap answer in a div for styling
                    var answerWrapper = document.createElement('div');
                    $(answerWrapper).addClass('answer__wrapper');
                    $(answer).append(answerWrapper);
                    
                    // Add an answer message div to wrap text answer, correct/wrong message and explanation response
                    var answerMessage = document.createElement('div');
                    $(answerMessage).addClass('answer__message');
                    $(answerWrapper).append(answerMessage);

                    // Add a marker icon span 
                    var answerMarker = document.createElement('div');
                    $(answerMarker).addClass('answer__marker');
                    $(answerWrapper).append(answerMarker);
                    
                    // Does this answer have an image (if tools stripped out empty image tags some of this would be unnecessary)
                    var answerImg = answer.querySelectorAll(':scope > img');
                    if (answerImg.length) {
                        if ($(answerImg).attr('src') !== '') {
                            $(answer).addClass('has-image');
                            $(answerImg).addClass('answer__img');
                            $(answerWrapper).append(answerImg);
                        } else {
                            $(answerImg).remove();
                            answerImg = '';
                        }
                    }

                    // Does this answer have text
                    var answerText = answer.querySelectorAll('.answer__text');
                    if (answerText.length) {
                        $(answerMessage).append(answerText);
                    }
                    
                    // Find this answers alpha key
                    var thisAnswer = String.fromCharCode(65 + index);
                    
                    // Is this answer the correct answer
                    if (thisAnswer == correctAnswerCode) {
                        $correctAnswer = $(answer);
                        $correctAnswerWrapper = $(answerMessage);
                    }

                    // Set up an onclick to handle when a user selects this answer
                    bean.on(answer, 'click', function() {
                        if ($(question).hasClass('answered')) {
                            // Question has already been answered 
                            return false;
                        } else {
                            // Mark question as answered and keep track of total q's answered
                            $(question).addClass('answered');
                            numAnswered ++;
                        }

                        // If necessary set up a call to check mpu position
                        if (moveMPU) {
                            startTime = null;
                            window.requestAnimationFrame(checkMPU);
                        }

                        // Flag the correct answer & add response if one is available
                        $correctAnswer.addClass('correct-answer');
                        if (correctAnswerExplanation) {
                            $correctAnswerWrapper.append('<p class="answer__explanation">' + correctAnswerExplanation.trim() + '</p>');
                        }

                        // Check if this answer is correct & mark question as correct or wrong
                        if (thisAnswer == correctAnswerCode) {
                            $(question).addClass('is-correct');
                            score ++;
                        } else {
                            $(question).addClass('is-wrong');
                            $(this).addClass('wrong-answer');
                        }

                        // When we have an image answer we need to move the positioning of the explanation and marker 
                        if (answerImg.length) {
                            var markedAnswers = question.querySelectorAll('.correct-answer, .wrong-answer');

                            $(markedAnswers).each(function(markedAnswer, index) {
                                var thisMessage = markedAnswer.querySelectorAll('.answer__message')[0],
                                    thisHeight = thisMessage.offsetHeight,
                                    thisMarker = markedAnswer.querySelectorAll('.answer__marker')[0];

                                    // position explanation to the bottom of wrapper
                                    thisMessage.style.top = 'calc(100% - ' + thisHeight + 'px)';
                                    thisMarker.style.top = 'calc(100% - ' + (thisHeight - 7) + 'px)';
                            });
                        }
                        // If all questions have been answered display the score
                        if (numQuestions == numAnswered) {
                            var scoreDisplayMessage = "";
                            for(var i = score; i >= 0; i--) {
                                if (scoreMessages[i]) {
                                    scoreDisplayMessage = scoreMessages[i]; 
                                    break;
                                }
                            }

                            // Add the score & message into resultPanel
                            $('.quiz-scores__correct').html(score.toString());
                            $('.quiz-scores__message').html(scoreDisplayMessage);

                            // Add open class to trigger transition
                            $('.quiz-scores').addClass('open');

                            // Scroll score panel into view
                            smoothScroll.animateScroll(null, '#quiz-scores', { speed: 1500, offset: 40 });
                        }
                    });
                });
            });
        }
    },

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            var quiz = $('.quiz');
            if (quiz.length) {
                // We have a quiz atom on the page so setup the quizzes
                modules.quizInit(quiz[0]);
            }
        }
    };

    return {
        init: ready
    };

});
/*global window,document,console,define */
define('bootstraps/article',[
    'bean',
    'bonzo',
    'modules/$',
    'modules/twitter',
    'modules/witness',
    'modules/outbrain',
    'modules/quiz',
    'smoothScroll'
], function (
    bean,
    bonzo,
    $,
    twitter,
    witness,
    outbrain,
    Quiz,
    smoothScroll
) {
    'use strict';

    var modules = {
        richLinkTracking: function() {
            $('.element-rich-link').each(function(richLink, index) {
                var link = richLink.querySelectorAll('a');
                if (link.length) {
                    var href = $(link).attr('href');
                    if (href !== '') {
                        $(link).attr('href', href + '?ArticleReferrer=RichLink');
                    }
                }
            });
        },

        insertOutbrain: function () {
            window.articleOutbrainInserter = function () {
                outbrain.load();
            };
            window.applyNativeFunctionCall('articleOutbrainInserter');
        },

        loadQuizzes: function () {
            Quiz.init();
        },

        formatImmersive : function(){
            if (!$('.immersive').length) {
                return false;
            }

            var viewPortHeight = bonzo.viewport().height,
                bgHeight = (viewPortHeight - $('body').css('margin-top').replace('px','')) + 'px',
                // progressBar = $('.progress__bar'),
                pageOffset = viewPortHeight * 0.75;

            // Override tone to feature for all immersive pages
            document.body.className = document.body.className.replace( /(tone--).+?\s/g , 'tone--feature1 ' );

            // set header image height to viewport height
            $('.article__header-bg, .article__header-bg .element > iframe').css('height', bgHeight);
            
            // TODO: This is just not a fix, we actually need for the embed to be sent through with prefixed & unprefixed styles
            var iframe = $('.article__header-bg .element > iframe');
            if (iframe.length) {
                var newSrc = iframe[0].srcdoc
                    .replace("transform: translate(-50%, -50%);", "-webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%);")
                    .replace(/-webkit-animation/g, "animation")
                    .replace(/animation/g, "-webkit-animation")
                    .replace(/-webkit-keyframes/g, "keyframes")
                    .replace(/@keyframes/g, "@-webkit-keyframes");
                iframe[0].srcdoc = newSrc;
            }

            // find all the section seperators & add classes
            $('.article h2').each(function() {
                if ($(this).html().trim() === '* * *') {
                    $(this).html('').addClass('section__rule').next().addClass('has__dropcap');
                }
            });

            // for each element--immersive add extra classes depending on siblings
            $('figure.element--immersive').each(function(){
                if($(this).next().hasClass('element-pullquote')){
                    $(this).next().addClass('quote--image');
                    $(this).addClass('quote--overlay').data('data-thing', '');
                }

                // if h2 comes after element--immersive and it is not a section seperator, then add extra styling                
                if($(this).next()[0].tagName === "H2" && !$(this).next().hasClass('section__rule')){
                    $(this).next().addClass('title--image');
                    $(this).addClass('title--overlay');
                    $(this).next().next().addClass('has__dropcap');
                }
            });

            var articleHeight = $('.article').offset().height; // measure article height after other adjustments so it is accurate
            // create chapter markers
            // modules.addProgressBarChapters(progressBar, articleHeight);

            // store all pullquotes top offset for later
            $('.element-pullquote').each(function(){
               var $this = $(this),
                    offset = $this.offset().top;
               $this.attr('data-offset', offset);
            });

            // set up click event for displaying figcaption
            bean.on(window, 'click.quote-overlay', $('.quote--overlay'), function(e) {
                e.preventDefault();
                $(this.querySelector('figcaption')).toggleClass('display');
            });

            // set up on scroll event for sliding pullquote into view and updating progress bar
            bean.on(window, 'scroll.immersive', window.ThrottleDebounce.debounce(10, false, function () {
                // slide pull-quotes into view
                $('.element-pullquote').each(function(){
                    var $this = $(this),
                        dataOffset = $this.attr('data-offset');

                    if(window.scrollY >= (dataOffset - pageOffset)) {
                        $this.addClass('animated').addClass('fadeInUp');
                    }
                });

                // update progress bar
                // modules.updateProgressBar(progressBar, articleHeight);
            }));


            // add a resize / orientation event to redraw the chapter positions for new article height
            bean.on(window, 'resize.cards orientationchange.cards', window.ThrottleDebounce.debounce(100, false, function () {
                // remeasure article height 
                articleHeight = $('.article').offset().height; // measure article height after other adjustments so it is accurate

                // empty the progress bar div 
                // progressBar.html('');

                // redraw chapter markets
                // modules.addProgressBarChapters(progressBar, articleHeight);

                // update progress position
                // modules.updateProgressBar(progressBar, articleHeight);

                // set header image height to new viewport height
                viewPortHeight = bonzo.viewport().height;
                bgHeight = (viewPortHeight - $('body').css('margin-top').replace('px','')) + 'px';
                $('.article__header-bg, .article__header-bg .element > iframe').css('height', bgHeight);
                
            }));

            // call updateProgressBar on first load
            // modules.updateProgressBar(progressBar, articleHeight);
        },

        addProgressBarChapters: function(progressBar, articleHeight) {
            $('.article h2').each(function() {
                var chapterPosition = Math.floor(($(this).offset().top / articleHeight) * 100) + "%",
                    thisChapter = '<div style="left:'+ chapterPosition + ';" class="progress__chapter"></div>';
                progressBar.append(thisChapter);
            });
        },

        updateProgressBar: function(progressBar, articleHeight) {
            var scrollPosition = (window.scrollY / articleHeight * 100) + "%";
            progressBar.css('width', scrollPosition);
        }
    },

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            twitter.init();
            twitter.enhanceTweets();
            witness.duplicate();
            modules.insertOutbrain();
            modules.loadQuizzes();
            modules.formatImmersive();
            modules.richLinkTracking();
        }
    };

    return {
        init: ready
    };
});

define('article',[
    'bootstraps/common',
    'bootstraps/article'
], function (
    Common,
    Article
) {
    'use strict';

    function init(){
        Common.init();
        Article.init();
    }

    return {
        init: init
    };
});


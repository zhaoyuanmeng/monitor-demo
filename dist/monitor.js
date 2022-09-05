var monitor = (function () {
  'use strict';

  // 不明白为什么要使用原型，可能是加快执行速度吧
  var originalProto = XMLHttpRequest.prototype;
  var originalOpen = originalProto.open;
  var originalSend = originalProto.send;

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  function deepCopy(target) {
    if (_typeof(target) === 'object') {
      var result = Array.isArray(target) ? [] : {};

      for (var key in target) {
        if (_typeof(target[key]) == 'object') {
          result[key] = deepCopy(target[key]);
        } else {
          result[key] = target[key];
        }
      }

      return result;
    }

    return target;
  } // 当一条会话历史记录被执行的时候将会触发页面显示 (pageshow) 事件。
  // (这包括了后退 / 前进按钮操作，同时也会在 onload 事件触发后初始化页面时触发)

  function onBFCacheRestore(callback) {
    window.addEventListener('pageshow', function (event) {
      // persisted表示网页是否来自于缓存
      if (event.persisted) {
        callback(event);
      }
    }, true);
  }
  function onBeforeunload(callback) {
    window.addEventListener('beforeunload', callback, true);
  }
  function onHidden(callback, once) {
    var onHiddenOrPageHide = function onHiddenOrPageHide(event) {
      if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
        callback(event);

        if (once) {
          window.removeEventListener('visibilitychange', onHiddenOrPageHide, true);
          window.removeEventListener('pagehide', onHiddenOrPageHide, true);
        }
      }
    };

    window.addEventListener('visibilitychange', onHiddenOrPageHide, true);
    window.addEventListener('pagehide', onHiddenOrPageHide, true);
  } // 就是保证加载后执行callback函数

  function executeAfterLoad(callback) {
    // document.readyState  loading（加载中） interactive（文档已被解析，但是诸如图像，样式表和框架之类的子资源仍在加载） 
    // complete（文档和所有子资源已完成加载。状态表示 load 事件即将被触发） 
    if (document.readyState === 'complete') {
      callback();
    } else {
      var onLoad = function onLoad() {
        callback();
        window.removeEventListener('load', onLoad, true);
      };

      window.addEventListener('load', onLoad, true);
    }
  } // 获取当前页面的url

  function getPageURL() {
    return window.location.href;
  }

  var cache = [];
  function getCache() {
    return deepCopy(cache);
  }
  function addCache(data) {
    cache.push(data);
  }
  function clearCache() {
    cache.length = 0;
  }

  function generateUniqueID() {
    return "v2-".concat(Date.now(), "-").concat(Math.floor(Math.random() * (9e12 - 1)) + 1e12);
  }

  var config = {
    url: '',
    appID: '',
    userID: '',
    vue: {
      Vue: null,
      router: null
    }
  };
  function setConfig(options) {
    for (var key in config) {
      if (options[key]) {
        config[key] = options[key];
      }
    }
  }

  function isSupportSendBeacon() {
    var _window$navigator;

    return !!((_window$navigator = window.navigator) !== null && _window$navigator !== void 0 && _window$navigator.sendBeacon);
  } // 在 unload 事件中，使用 XHR 异步发送数据。这种做法有可能导致服务端未收到数据，浏览器就已经断开连接,，数据就会丢失。
  // 虽然AJAX支持同步请求，但这种做法会阻塞页面的跳转，影响用户体验。
  // 基于此引入Beacon这种方法，使用navigator.sendBeacon(url, data) 方法会使用户代理在有机会时异步地向服务器发送数据，
  // 同时不会延迟页面的卸载或影响下一导航的载入性能。
  // 所以这个sendBeacon 如果支持就是sendBeacon方法，如果不支持就是XMLHttpRequest的传统ajax形式

  var sendBeacon = isSupportSendBeacon() ? window.navigator.sendBeacon.bind(window.navigator) : reportWithXHR; // 随机获取一个sessionID

  var sessionID = generateUniqueID(); // 数据上报  暂时不知道isImmediate这个（立即）有什么用处

  function report(data) {
    var isImmediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (!config.url) {
      console.error('请设置上传 url 地址');
    }

    var reportData = JSON.stringify({
      id: sessionID,
      appID: config.appID,
      userID: config.userID,
      data: data
    });

    if (isImmediate) {
      sendBeacon(config.url, reportData);
      return;
    } //window.requestIdleCallback()**方法插入一个函数，这个函数将在浏览器空闲时期被调用。
    // 这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。
    // 函数一般会按先进先调用的顺序执行，然而，如果回调函数指定了执行超时时间timeout，则有可能为了在超时前执行函数而打乱执行顺序。
    // 这就是为了延迟执行    


    if (window.requestIdleCallback) {
      window.requestIdleCallback(function () {
        sendBeacon(config.url, reportData);
      }, {
        timeout: 3000
      });
    } else {
      setTimeout(function () {
        sendBeacon(config.url, reportData);
      });
    }
  }
  var timer$2 = null; // 加入了防抖的思想 不过每次点击都会把这个错误加入到cache中 只是停顿3s才会上报

  function lazyReportCache(data) {
    var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;
    addCache(data);
    clearTimeout(timer$2);
    timer$2 = setTimeout(function () {
      var data = getCache();

      if (data.length) {
        report(data);
        clearCache();
      }
    }, timeout);
  }
  function reportWithXHR(data) {
    var xhr = new XMLHttpRequest();
    originalOpen.call(xhr, 'post', config.url);
    originalSend.call(xhr, JSON.stringify(data));
  }

  function error() {
    var _this = this,
        _config$vue;

    // 这里利用了切片编程 跟vue2监听数组的方式改写本身方法思路一样
    var oldConsoleError = window.console.error;

    window.console.error = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 保证了之前的方式
      oldConsoleError.apply(_this, args); // 新增的处理

      lazyReportCache({
        type: 'error',
        subType: 'console-error',
        // performance是全局对象可以直接引用在v8引擎下
        startTime: performance.now(),
        errData: args,
        pageURL: getPageURL()
      });
    }; // 捕获资源加载失败错误 js css img...


    window.addEventListener('error', function (e) {
      var target = e.target;
      if (!target) return;

      if (target.src || target.href) {
        var url = target.src || target.href;
        lazyReportCache({
          url: url,
          type: 'error',
          subType: 'resource',
          startTime: e.timeStamp,
          html: target.outerHTML,
          resourceType: target.tagName,
          paths: e.path.map(function (item) {
            return item.tagName;
          }).filter(Boolean),
          pageURL: getPageURL()
        });
      }
    }, true); // 监听 js 错误

    window.onerror = function (msg, url, line, column, error) {
      lazyReportCache({
        msg: msg,
        line: line,
        column: column,
        error: error.stack,
        subType: 'js',
        pageURL: url,
        type: 'error',
        startTime: performance.now()
      });
    }; // 监听 promise 错误 缺点是获取不到列数据 后期补充优化方案


    window.addEventListener('unhandledrejection', function (e) {
      var _e$reason;

      lazyReportCache({
        reason: (_e$reason = e.reason) === null || _e$reason === void 0 ? void 0 : _e$reason.stack,
        subType: 'promise',
        type: 'error',
        startTime: e.timeStamp,
        pageURL: getPageURL()
      });
    }); // 这个就要对接上vue的报错了，vue会给我们提供一个回调函数的写法就是下面的这样
    // 思路拓展一下 react的不也可以吗

    if ((_config$vue = config.vue) !== null && _config$vue !== void 0 && _config$vue.Vue) {
      config.vue.Vue.config.errorHandler = function (err, vm, info) {
        console.error(err);
        lazyReportCache({
          info: info,
          error: err.stack,
          subType: 'vue',
          type: 'error',
          startTime: performance.now(),
          pageURL: getPageURL()
        });
      };
    } // 这里表示也要检查缓存的页面数据


    onBFCacheRestore(function () {
      error();
    });
  }

  // 判断是否支持PerformanceObserver 
  // PerformanceObserver 可用于获取性能相关的数据，例如首帧fp、首屏fcp、首次有意义的绘制 fmp等等
  function isSupportPerformanceObserver() {
    return !!window.PerformanceObserver;
  }

  function observeEntries() {
    executeAfterLoad(function () {
      observeEvent('resource');
      observeEvent('navigation');
    });
  }
  var hasAlreadyCollected = false;
  function observeEvent(entryType) {
    // 闭包的思路
    // 这个是为了处理传统分析页面性能分析的（兼容Performance的写法）
    function entryHandler(list) {
      var data = list.getEntries ? list.getEntries() : list;

      var _iterator = _createForOfIteratorHelper(data),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;

          if (entryType === 'navigation') {
            if (hasAlreadyCollected) return;

            if (observer) {
              observer.disconnect();
            }

            hasAlreadyCollected = true;
          } // nextHopProtocol 属性为空，说明资源解析错误或者跨域
          // beacon 用于上报数据，所以不统计。xhr fetch 单独统计


          if (!entry.nextHopProtocol && entryType !== 'navigation' || filter(entry.initiatorType)) {
            return;
          }

          lazyReportCache({
            name: entry.name,
            // 资源名称
            subType: entryType,
            type: 'performance',
            sourceType: entry.initiatorType,
            // 资源类型
            duration: entry.duration,
            // 资源加载耗时
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            // DNS 耗时
            tcp: entry.connectEnd - entry.connectStart,
            // 建立 tcp 连接耗时
            redirect: entry.redirectEnd - entry.redirectStart,
            // 重定向耗时
            ttfb: entry.responseStart,
            // 首字节时间
            protocol: entry.nextHopProtocol,
            // 请求协议
            responseBodySize: entry.encodedBodySize,
            // 响应内容大小
            responseHeaderSize: entry.transferSize - entry.encodedBodySize,
            // 响应头部大小
            resourceSize: entry.decodedBodySize,
            // 资源解压后的大小
            isCache: isCache(entry),
            // 是否命中缓存
            startTime: performance.now()
          });
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    var observer;

    if (isSupportPerformanceObserver()) {
      observer = new PerformanceObserver(entryHandler);
      observer.observe({
        type: entryType,
        buffered: true
      });
    } else {
      var data = window.performance.getEntriesByType(entryType);
      entryHandler(data);
    }
  } // 不统计以下类型的资源

  var preventType = ['fetch', 'xmlhttprequest', 'beacon'];
  var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  if (isSafari) {
    // safari 会把接口请求当成 other
    preventType.push('other');
  }

  function filter(type) {
    // 返回Boolean
    return preventType.includes(type);
  }

  function isCache(entry) {
    // 直接从缓存读取或 304
    return entry.transferSize === 0 || entry.transferSize !== 0 && entry.encodedBodySize === 0;
  }

  function observePaint() {
    if (!isSupportPerformanceObserver()) return;

    var entryHandler = function entryHandler(list) {
      var _iterator = _createForOfIteratorHelper(list.getEntries()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;

          if (entry.name === 'first-contentful-paint') {
            observer.disconnect();
          }

          var json = entry.toJSON();
          delete json.duration;

          var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
            subType: entry.name,
            type: 'performance',
            pageURL: getPageURL()
          });

          lazyReportCache(reportData);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };

    var observer = new PerformanceObserver(entryHandler);
    observer.observe({
      type: 'paint',
      buffered: true
    });
    onBFCacheRestore(function (event) {
      requestAnimationFrame(function () {
        ['first-paint', 'first-contentful-paint'].forEach(function (type) {
          lazyReportCache({
            startTime: performance.now() - event.timeStamp,
            name: type,
            subType: type,
            type: 'performance',
            pageURL: getPageURL(),
            bfc: true
          });
        });
      });
    });
  }

  var lcpDone = false;
  function isLCPDone() {
    return lcpDone;
  }
  function observeLCP() {
    if (!isSupportPerformanceObserver()) {
      lcpDone = true;
      return;
    }

    var entryHandler = function entryHandler(list) {
      lcpDone = true;

      if (observer) {
        observer.disconnect();
      }

      var _iterator = _createForOfIteratorHelper(list.getEntries()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _entry$element;

          var entry = _step.value;
          var json = entry.toJSON();
          delete json.duration;

          var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
            target: (_entry$element = entry.element) === null || _entry$element === void 0 ? void 0 : _entry$element.tagName,
            name: entry.entryType,
            subType: entry.entryType,
            type: 'performance',
            pageURL: getPageURL()
          });

          lazyReportCache(reportData);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };

    var observer = new PerformanceObserver(entryHandler);
    observer.observe({
      type: 'largest-contentful-paint',
      buffered: true
    });
    onBFCacheRestore(function (event) {
      requestAnimationFrame(function () {
        lazyReportCache({
          startTime: performance.now() - event.timeStamp,
          name: 'largest-contentful-paint',
          subType: 'largest-contentful-paint',
          type: 'performance',
          pageURL: getPageURL(),
          bfc: true
        });
      });
    });
  }

  function observeCLS() {
    if (!isSupportPerformanceObserver()) return;
    onBFCacheRestore(function () {
      observeCLS();
    });
    var sessionValue = 0;
    var sessionEntries = [];
    var cls = {
      subType: 'layout-shift',
      name: 'layout-shift',
      type: 'performance',
      pageURL: getPageURL(),
      value: 0
    };

    var entryHandler = function entryHandler(list) {
      var _iterator = _createForOfIteratorHelper(list.getEntries()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;

          // Only count layout shifts without recent user input.
          if (!entry.hadRecentInput) {
            var firstSessionEntry = sessionEntries[0];
            var lastSessionEntry = sessionEntries[sessionEntries.length - 1]; // If the entry occurred less than 1 second after the previous entry and
            // less than 5 seconds after the first entry in the session, include the
            // entry in the current session. Otherwise, start a new session.

            if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 && entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(formatCLSEntry(entry));
            } else {
              sessionValue = entry.value;
              sessionEntries = [formatCLSEntry(entry)];
            } // If the current session value is larger than the current CLS value,
            // update CLS and the entries contributing to it.


            if (sessionValue > cls.value) {
              cls.value = sessionValue;
              cls.entries = sessionEntries;
              cls.startTime = performance.now();
              lazyReportCache(deepCopy(cls));
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };

    var observer = new PerformanceObserver(entryHandler);
    observer.observe({
      type: 'layout-shift',
      buffered: true
    });

    if (observer) {
      onHidden(function () {
        observer.takeRecords().map(entryHandler);
      });
    }
  }

  function formatCLSEntry(entry) {
    var result = entry.toJSON();
    delete result.duration;
    delete result.sources;
    return result;
  }

  function observeFID() {
    onBFCacheRestore(function () {
      observeFID();
    });

    if (!isSupportPerformanceObserver()) {
      var entryHandler = function entryHandler(list) {
        if (observer) {
          observer.disconnect();
        }

        var _iterator = _createForOfIteratorHelper(list.getEntries()),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;
            var json = entry.toJSON();
            json.nodeName = entry.tagName;
            json.event = json.name;
            json.name = json.entryType;
            json.type = 'performance';
            json.pageURL = getPageURL();
            delete json.cancelable;
            lazyReportCache(json);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      };

      var observer = new PerformanceObserver(entryHandler);
      observer.observe({
        type: 'first-input',
        buffered: true
      });
      return;
    }

    fidPolyfill();
  }

  function fidPolyfill() {
    eachEventType(window.addEventListener);
  }

  function onInput(event) {
    // Only count cancelable events, which should trigger behavior
    // important to the user.
    if (event.cancelable) {
      // In some browsers `event.timeStamp` returns a `DOMTimeStamp` value
      // (epoch time) instead of the newer `DOMHighResTimeStamp`
      // (document-origin time). To check for that we assume any timestamp
      // greater than 1 trillion is a `DOMTimeStamp`, and compare it using
      // the `Date` object rather than `performance.now()`.
      // - https://github.com/GoogleChromeLabs/first-input-delay/issues/4
      var isEpochTime = event.timeStamp > 1e12;
      var now = isEpochTime ? Date.now() : performance.now(); // Input delay is the delta between when the system received the event
      // (e.g. event.timeStamp) and when it could run the callback (e.g. `now`).

      var duration = now - event.timeStamp;
      lazyReportCache({
        duration: duration,
        subType: 'first-input',
        event: event.type,
        name: 'first-input',
        target: event.target.tagName,
        startTime: event.timeStamp,
        type: 'performance',
        pageURL: getPageURL()
      });
      eachEventType(window.removeEventListener);
    }
  }

  function eachEventType(callback) {
    var eventTypes = ['mousedown', 'keydown', 'touchstart'];
    eventTypes.forEach(function (type) {
      return callback(type, onInput, {
        passive: true,
        capture: true
      });
    });
  }

  function observerLoad() {
    ['load', 'DOMContentLoaded'].forEach(function (type) {
      return onEvent(type);
    });
    onBFCacheRestore(function (event) {
      requestAnimationFrame(function () {
        ['load', 'DOMContentLoaded'].forEach(function (type) {
          lazyReportCache({
            startTime: performance.now() - event.timeStamp,
            subType: type.toLocaleLowerCase(),
            type: 'performance',
            pageURL: getPageURL(),
            bfc: true
          });
        });
      });
    });
  }

  function onEvent(type) {
    function callback() {
      lazyReportCache({
        type: 'performance',
        subType: type.toLocaleLowerCase(),
        startTime: performance.now()
      });
      window.removeEventListener(type, callback, true);
    }

    window.addEventListener(type, callback, true);
  }

  var isOnLoaded = false;
  executeAfterLoad(function () {
    isOnLoaded = true;
  });
  var timer$1;
  var observer;

  function checkDOMChange() {
    clearTimeout(timer$1);
    timer$1 = setTimeout(function () {
      // 等 load、lcp 事件触发后并且 DOM 树不再变化时，计算首屏渲染时间
      if (isOnLoaded && isLCPDone()) {
        observer && observer.disconnect();
        lazyReportCache({
          type: 'performance',
          subType: 'first-screen-paint',
          startTime: getRenderTime(),
          pageURL: getPageURL()
        });
        entries = null;
      } else {
        checkDOMChange();
      }
    }, 500);
  }

  var entries = [];
  function observeFirstScreenPaint() {
    if (!MutationObserver) return;
    var next = window.requestAnimationFrame ? requestAnimationFrame : setTimeout;
    var ignoreDOMList = ['STYLE', 'SCRIPT', 'LINK', 'META'];
    observer = new MutationObserver(function (mutationList) {
      checkDOMChange();
      var entry = {
        startTime: 0,
        children: []
      };
      next(function () {
        entry.startTime = performance.now();
      });

      var _iterator = _createForOfIteratorHelper(mutationList),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var mutation = _step.value;

          if (mutation.addedNodes.length) {
            for (var _i = 0, _Array$from = Array.from(mutation.addedNodes); _i < _Array$from.length; _i++) {
              var node = _Array$from[_i];

              if (node.nodeType === 1 && !ignoreDOMList.includes(node.tagName) && !isInclude(node, entry.children)) {
                entry.children.push(node);
              }
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (entry.children.length) {
        entries.push(entry);
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true
    });
    onBFCacheRestore(function (event) {
      requestAnimationFrame(function () {
        lazyReportCache({
          startTime: performance.now() - event.timeStamp,
          type: 'performance',
          subType: 'first-screen-paint',
          bfc: true,
          pageURL: getPageURL()
        });
      });
    });
  }

  function getRenderTime() {
    var startTime = 0;
    entries.forEach(function (entry) {
      var _iterator2 = _createForOfIteratorHelper(entry.children),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var node = _step2.value;

          if (isInScreen(node) && entry.startTime > startTime && needToCalculate(node)) {
            startTime = entry.startTime;
            break;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }); // 需要和当前页面所有加载图片的时间做对比，取最大值
    // 图片请求时间要小于 startTime，响应结束时间要大于 startTime

    performance.getEntriesByType('resource').forEach(function (item) {
      if (item.initiatorType === 'img' && item.fetchStart < startTime && item.responseEnd > startTime) {
        startTime = item.responseEnd;
      }
    });
    return startTime;
  }

  function needToCalculate(node) {
    // 隐藏的元素不用计算
    if (window.getComputedStyle(node).display === 'none') return false; // 用于统计的图片不用计算

    if (node.tagName === 'IMG' && node.width < 2 && node.height < 2) {
      return false;
    }

    return true;
  }

  function isInclude(node, arr) {
    if (!node || node === document.documentElement) {
      return false;
    }

    if (arr.includes(node)) {
      return true;
    }

    return isInclude(node.parentElement, arr);
  }

  var viewportWidth = window.innerWidth;
  var viewportHeight$1 = window.innerHeight; // dom 对象是否在屏幕内

  function isInScreen(dom) {
    var rectInfo = dom.getBoundingClientRect();

    if (rectInfo.left >= 0 && rectInfo.left < viewportWidth && rectInfo.top >= 0 && rectInfo.top < viewportHeight$1) {
      return true;
    }
  }

  function overwriteOpenAndSend() {
    originalProto.open = function newOpen() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.url = args[1];
      this.method = args[0];
      originalOpen.apply(this, args);
    };

    originalProto.send = function newSend() {
      var _this = this;

      this.startTime = Date.now();

      var onLoadend = function onLoadend() {
        _this.endTime = Date.now();
        _this.duration = _this.endTime - _this.startTime;
        var status = _this.status,
            duration = _this.duration,
            startTime = _this.startTime,
            endTime = _this.endTime,
            url = _this.url,
            method = _this.method;
        var reportData = {
          status: status,
          duration: duration,
          startTime: startTime,
          endTime: endTime,
          url: url,
          method: (method || 'GET').toUpperCase(),
          success: status >= 200 && status < 300,
          subType: 'xhr',
          type: 'performance'
        };
        lazyReportCache(reportData);

        _this.removeEventListener('loadend', onLoadend, true);
      };

      this.addEventListener('loadend', onLoadend, true);

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      originalSend.apply(this, args);
    };
  }

  function xhr() {
    overwriteOpenAndSend();
  }

  var originalFetch = window.fetch;

  function overwriteFetch() {
    window.fetch = function newFetch(url, config) {
      var startTime = Date.now();
      var reportData = {
        startTime: startTime,
        url: url,
        method: ((config === null || config === void 0 ? void 0 : config.method) || 'GET').toUpperCase(),
        subType: 'fetch',
        type: 'performance'
      };
      return originalFetch(url, config).then(function (res) {
        reportData.endTime = Date.now();
        reportData.duration = reportData.endTime - reportData.startTime;
        var data = res.clone();
        reportData.status = data.status;
        reportData.success = data.ok;
        lazyReportCache(reportData);
        return res;
      }).catch(function (err) {
        reportData.endTime = Date.now();
        reportData.duration = reportData.endTime - reportData.startTime;
        reportData.status = 0;
        reportData.success = false;
        lazyReportCache(reportData);
        throw err;
      });
    };
  }

  function fetch() {
    overwriteFetch();
  }

  var next = window.requestAnimationFrame ? requestAnimationFrame : function (callback) {
    setTimeout(callback, 1000 / 60);
  };
  var frames = [];
  function fps() {
    var frame = 0;
    var lastSecond = Date.now();

    function calculateFPS() {
      frame++;
      var now = Date.now();

      if (lastSecond + 1000 <= now) {
        // 由于 now - lastSecond 的单位是毫秒，所以 frame 要 * 1000
        var _fps = Math.round(frame * 1000 / (now - lastSecond));

        frames.push(_fps);
        frame = 0;
        lastSecond = now;
      } // 避免上报太快，缓存一定数量再上报


      if (frames.length >= 60) {
        report(deepCopy({
          frames: frames,
          type: 'performace',
          subType: 'fps'
        }));
        frames.length = 0;
      }

      next(calculateFPS);
    }

    calculateFPS();
  }

  function onVueRouter$1(Vue, router) {
    var isFirst = true;
    var startTime;
    router.beforeEach(function (to, from, next) {
      // 首次进入页面已经有其他统计的渲染时间可用
      if (isFirst) {
        isFirst = false;
        return next();
      } // 给 router 新增一个字段，表示是否要计算渲染时间
      // 只有路由跳转才需要计算


      router.needCalculateRenderTime = true;
      startTime = performance.now();
      next();
    });
    var timer;
    Vue.mixin({
      mounted: function mounted() {
        if (!router.needCalculateRenderTime) return;
        this.$nextTick(function () {
          // 仅在整个视图都被渲染之后才会运行的代码
          var now = performance.now();
          clearTimeout(timer);
          timer = setTimeout(function () {
            router.needCalculateRenderTime = false;
            lazyReportCache({
              type: 'performance',
              subType: 'vue-router-change-paint',
              duration: now - startTime,
              startTime: now,
              pageURL: getPageURL()
            });
          }, 1000);
        });
      }
    });
  }

  function performance$1() {
    var _config$vue, _config$vue2;

    // 监控上报页面指标信息
    observeEntries();
    observePaint();
    observeLCP();
    observeCLS();
    observeFID();
    xhr();
    fetch();
    fps();
    observerLoad();
    observeFirstScreenPaint();

    if ((_config$vue = config.vue) !== null && _config$vue !== void 0 && _config$vue.Vue && (_config$vue2 = config.vue) !== null && _config$vue2 !== void 0 && _config$vue2.router) {
      onVueRouter$1(config.vue.Vue, config.vue.router);
    }
  }

  var uuid = '';
  function getUUID() {
    if (uuid) return uuid; // 如果是手机 APP，可以调用原生方法或者设备唯一标识当成 uuid

    uuid = localStorage.getItem('uuid');
    if (uuid) return uuid;
    uuid = generateUniqueID();
    localStorage.setItem('uuid', uuid);
    return uuid;
  }

  function pv() {
    lazyReportCache({
      type: 'behavior',
      subType: 'pv',
      startTime: performance.now(),
      pageURL: getPageURL(),
      referrer: document.referrer,
      uuid: getUUID()
    });
  }

  function pageAccessDuration() {
    onBeforeunload(function () {
      report({
        type: 'behavior',
        subType: 'page-access-duration',
        startTime: performance.now(),
        pageURL: getPageURL(),
        uuid: getUUID()
      }, true);
    });
  }

  var timer;
  var startTime = 0;
  var hasReport = false;
  var pageHeight = 0;
  var scrollTop = 0;
  var viewportHeight = 0;
  function pageAccessHeight() {
    window.addEventListener('scroll', onScroll);
    onBeforeunload(function () {
      var now = performance.now();
      report({
        startTime: now,
        duration: now - startTime,
        type: 'behavior',
        subType: 'page-access-height',
        pageURL: getPageURL(),
        value: toPercent((scrollTop + viewportHeight) / pageHeight),
        uuid: getUUID()
      }, true);
    }); // 页面加载完成后初始化记录当前访问高度、时间

    executeAfterLoad(function () {
      startTime = performance.now();
      pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      viewportHeight = window.innerHeight;
    });
  }

  function onScroll() {
    clearTimeout(timer);
    var now = performance.now();

    if (!hasReport) {
      hasReport = true;
      lazyReportCache({
        startTime: now,
        duration: now - startTime,
        type: 'behavior',
        subType: 'page-access-height',
        pageURL: getPageURL(),
        value: toPercent((scrollTop + viewportHeight) / pageHeight),
        uuid: getUUID()
      });
    }

    timer = setTimeout(function () {
      hasReport = false;
      startTime = now;
      pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      viewportHeight = window.innerHeight;
    }, 500);
  }

  function toPercent(val) {
    if (val >= 1) return '100%';
    return (val * 100).toFixed(2) + '%';
  }

  function onClick() {
    ['mousedown', 'touchstart'].forEach(function (eventType) {
      var timer;
      window.addEventListener(eventType, function (event) {
        clearTimeout(timer);
        timer = setTimeout(function () {
          var _event$path;

          var target = event.target;

          var _target$getBoundingCl = target.getBoundingClientRect(),
              top = _target$getBoundingCl.top,
              left = _target$getBoundingCl.left;

          lazyReportCache({
            top: top,
            left: left,
            eventType: eventType,
            pageHeight: document.documentElement.scrollHeight || document.body.scrollHeight,
            scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
            type: 'behavior',
            subType: 'click',
            target: target.tagName,
            paths: (_event$path = event.path) === null || _event$path === void 0 ? void 0 : _event$path.map(function (item) {
              return item.tagName;
            }).filter(Boolean),
            startTime: event.timeStamp,
            pageURL: getPageURL(),
            outerHTML: target.outerHTML,
            innerHTML: target.innerHTML,
            width: target.offsetWidth,
            height: target.offsetHeight,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            uuid: getUUID()
          });
        }, 500);
      });
    });
  }

  function onVueRouter(router) {
    router.beforeEach(function (to, from, next) {
      // 首次加载页面不用统计
      if (!from.name) {
        return next();
      }

      var data = {
        params: to.params,
        query: to.query
      };
      lazyReportCache({
        data: data,
        name: to.name || to.path,
        type: 'behavior',
        subType: ['vue-router-change', 'pv'],
        startTime: performance.now(),
        from: from.fullPath,
        to: to.fullPath,
        uuid: getUUID()
      });
      next();
    });
  }

  function pageChange() {
    var from = '';
    window.addEventListener('popstate', function () {
      var to = getPageURL();
      lazyReportCache({
        from: from,
        to: to,
        type: 'behavior',
        subType: 'popstate',
        startTime: performance.now(),
        uuid: getUUID()
      });
      from = to;
    }, true);
    var oldURL = '';
    window.addEventListener('hashchange', function (event) {
      var newURL = event.newURL;
      lazyReportCache({
        from: oldURL,
        to: newURL,
        type: 'behavior',
        subType: 'hashchange',
        startTime: performance.now(),
        uuid: getUUID()
      });
      oldURL = newURL;
    }, true);
  }

  function behavior() {
    var _config$vue;

    pv();
    pageAccessDuration();
    pageAccessHeight();
    onClick();
    pageChange();

    if ((_config$vue = config.vue) !== null && _config$vue !== void 0 && _config$vue.router) {
      onVueRouter(config.vue.router);
    }
  }

  var monitor = {
    init: function init() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // 生成配置
      setConfig(options); // 处理报错信息并上传

      error();
      performance$1();
      behavior(); // 当页面进入后台或关闭前时，将所有的 cache 数据进行上报

      [onBeforeunload, onHidden].forEach(function (fn) {
        fn(function () {
          var data = getCache();

          if (data.length) {
            report(data, true);
            clearCache();
          }
        });
      });
    },
    report: report
  };

  return monitor;

})();
//# sourceMappingURL=monitor.js.map

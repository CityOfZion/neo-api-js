import { IntervalUtil } from '../utils/interval.js';

export var service = Service();

function Service () {

    // All requests under the same policy will get coalesced.
    function PollingPolicy (options) {

        this.options = options;
        this.stopAll = function () {}; //set by PollRunner
        this.startAll = function () {}; //set by PollRunner

        this._interval = function () {};
        this._requests = [];
    }

    //When Batch of methods complete
    PollingPolicy.prototype.onInterval = onInterval;
    PollingPolicy.prototype.run = run;

    function onInterval (fn) {

        if (typeof fn !== 'function') {
            throw new Error('onInterval(fn) - "fn" must be of type "function"');
        }

        this._interval = fn;
    }

    function run (method) {
        this._requests.push(method);
    }

    function createPollingPolicy (options) {
        return new PollingPolicy(options);
    }

    function isPollingPolicy (obj) {
        return obj instanceof PollingPolicy;
    }

    //number, optionsObj or PollPolicy
    function getPollRunner (obj) {

        if(obj instanceof PollingPolicy) {
            if (!obj._pollRunner) {
                obj._pollRunner = new PollRunner(obj);
            }

            return obj._pollRunner;
        }

        return new PollRunner(new PollingPolicy(obj));
    }

    return {
        createPollingPolicy: createPollingPolicy,
        isPollingPolicy: isPollingPolicy,
        getPollRunner: getPollRunner
    };
}

function PollRunner (policy) {

    var intervalUtil = new IntervalUtil(policy.options);
    var _isPaused = false;
    var _isPolling = false;
    
    this.isPolling = isPolling;
    this.addRequest = addRequest;
    this.pause = pause;
    this.play = play;

    policy.stopAll = pause;
    policy.startAll = play;

    function isPolling() {
        return _isPolling || intervalUtil.isRunning();
    }

    function addRequest (request) {
        policy._requests.push(request);

        return this;
    }

    function pause() {
        _isPaused = true;

        intervalUtil.stop();
    }

    function play() {
        if (_isPaused) {
            _isPaused = false;

            intervalUtil.start(runAll);
        }
    }

    setTimeout(runAll, 0);

    function runAll () {
        var count = policy._requests.length;

        _isPolling = true;

        policy._requests.forEach(function (request) {
            request().then(complete).catch(complete);
        });

        function complete () {
            --count;

            if (count === 0) {
                policy._interval();

                _isPolling = false;

                if (!_isPaused) {
                    intervalUtil.start(runAll);
                }
            }
        }
    }
}
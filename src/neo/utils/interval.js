export function IntervalUtil (options) {

    var _defaults = {
        interval: 25 * 1000,            //25 Seconds
        errorInterval: 5 * 60 * 1000    //5 Minutes
    };

    var _options;
    var _intervalFunction;
    var _intervalId;
    var _running;

    if (typeof options === 'number') {

        options = Math.max(1000, options); //1 second minimum

        options = {interval: options};
    }

    _options = Object.assign({}, _defaults, options || {});

    //function noop () {}

    function start (intervalFunction) {

        if (_running) {
            stop();
        }

        _intervalFunction = intervalFunction;
        _running = true;

        _startInterval(_options.interval);
    }

    function stop () {
        _running = false;
        clearTimeout(_intervalId);
    }

    function isRunning () {
        return _running;
    }

    function _startInterval (delay) {

        _intervalId = setTimeout(function () {
            _intervalFunction();
        }, delay);
    }

    this.stop = stop;
    this.start = start;
    this.isRunning = isRunning;
}

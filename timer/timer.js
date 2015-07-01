$(window).load(function(){

var $startBtn = $('#startBtn');
var $stopBtn = $('#stopBtn');
var $resetBtn = $('#resetBtn');
var $totalCount = $('#totalCount');
var $count = $('#count');
var $startTime = $('#startTime');
var $timer = $('#timer');
var $savedTimes = $('#savedTimes');
var $savedPeriods = $('#savedPeriods');

var totalCount, tickID;

var _so = new StoredObj('WorkTimer', {savedTimes: [], savedPeriods: [], stDate: false});

if (_so.stDate) {
    $stopBtn.show();
    $startBtn.hide();
    $count.show();
    tickID = setInterval(tick, 100);
    $startTime.text(date2str(_so.stDate));
} else {
    $stopBtn.hide();
    $startBtn.show();
    $count.hide();
};

displaySavedTimes();
displaySavedPeriods();

$(document).keyup(function(event){
    if (event.keyCode == 27 && _so.stDate) {
        stopTimer();
    }

    if (event.keyCode == 13 && !_so.stDate) {
        startTimer();
    }
 });

$startBtn.click(startTimer);

$stopBtn.click(stopTimer);

$resetBtn.click(function(){
    clearInterval(tickID);
    if (_so.savedTimes.length > 0) {
        _so.savedPeriods.unshift(
            [totalCount,
            _so.savedTimes[_so.savedTimes.length - 1][0],
            _so.savedTimes[0][1]]
        );
    };
    _so.stDate = false;
    _so.savedTimes = [];
    _so.save();
    displaySavedPeriods();
    displaySavedTimes();
    $count.hide();
    $stopBtn.hide();
    $startBtn.show();
    return false;
});

function tick(){
    var d = Date.now();
    $timer.text(date2str(d));
    $totalCount.text(ms2str(totalCount + (d - _so.stDate)));
}

function startTimer() {
    _so.stDate = Date.now();
    _so.save();
    tickID = setInterval(tick, 100);
    $startTime.text(date2str(_so.stDate));
    $count.show();
    $stopBtn.show();
    $startBtn.hide();
    return false;
}

function stopTimer() {
    clearInterval(tickID);
    var d = Date.now();
    _so.savedTimes.unshift([_so.stDate, d]);
    _so.stDate = false;
    _so.save();
    displaySavedTimes();
    $count.hide();
    $stopBtn.hide();
    $startBtn.show();
    return false;
}

function displaySavedTimes() {
    var p = '';
    var s = $('#stLineTemplate').text();
    totalCount = 0;

    for(var i=0; i<_so.savedTimes.length; i++) {
        p = p + sprintf(s, ms2str(_so.savedTimes[i][1] - _so.savedTimes[i][0]),
            date2str(_so.savedTimes[i][0]), date2str(_so.savedTimes[i][1]));
        totalCount += (_so.savedTimes[i][1] - _so.savedTimes[i][0]);
    }
    if (!_so.stDate) {
        $totalCount.text(ms2str(totalCount));
    };
    $savedTimes.html(p);

    $('.e').click(function() {
        var $stLine = $(this).closest('.stLine');
        var n = $('.stLine').index($stLine);
        var stMin = (n < _so.savedTimes.length - 1) ?
            _so.savedTimes[n+1][1] :
            (_so.savedTimes[n][0] - 3600000);
        var stMax = (n <= 0) ?
            (_so.stDate || Date.now()) :
            _so.savedTimes[n-1][0];
        var sliderMin = _so.savedTimes[n][0];
        var sliderMax = _so.savedTimes[n][1];
        var s = $('#sliderTemplate').text();

        $('.e, .x').hide();

        $stLine.replaceWith(s);

        $('#theSlider').slider({
            min: stMin,
            max: stMax,
            value: [_so.savedTimes[n][0], _so.savedTimes[n][1]],
            tooltip: 'always',
            ticks: [stMin, stMax],
            ticks_labels: [date2str(stMin), date2str(stMax)],
            formatter: function(value) {
                if (date2str(value[0]) == date2str(value[1])) {
                    return 'Delete';
                };
                return date2str(value[0]) + ' : ' + date2str(value[1]);
            }
        }).on('slide', function(slideEvt) {
            sliderMin = slideEvt.value[0];
            sliderMax = slideEvt.value[1];
        });

        $('#okBtn').click(function(){
            if (date2str(sliderMin) == date2str(sliderMax)) {
                _so.savedTimes.splice(n,1);
            } else {
                _so.savedTimes[n] = [sliderMin, sliderMax];
            };
            _so.save();
            displaySavedTimes();
            return false;
        });
        $('#cancelBtn').click(function(){
            displaySavedTimes();
            return false;
        });
        return false;
    });
    $('.x').click(function() {
        var n = $('.stLine').index($(this).closest('.stLine'));
        _so.savedTimes.splice(n,1);
        _so.save();
        displaySavedTimes();
        return false;
    });
}

function displaySavedPeriods() {
    var p = '';
    var s = $('#periodTemplate').text();
    for(var i=0; i<_so.savedPeriods.length; i++) {
        p = p + sprintf(s, ms2str(_so.savedPeriods[i][0]),
            date2Str(_so.savedPeriods[i][1]), date2Str(_so.savedPeriods[i][2]));
    }
    $savedPeriods.html(p);
    
    $('.xx').click(function() {
        var n = $('.prdLine').index($(this).closest('.prdLine'));
        _so.savedPeriods.splice(n,1);
        _so.save();
        displaySavedPeriods();
        return false;
    });
}

function sprintf(f) {
    for( var i=1; i < arguments.length; i++ ) {
        f = f.replace(/%s/, arguments[i]);
    }
    return f;
}

function lz(t) {
    return (t < 10) ? '0' + t : '' + t;
}

function date2str(d) {
    var d = new Date(d);
    return lz(d.getHours()) + ':'
        + lz(d.getMinutes()) + ':'
        + lz(d.getSeconds());
}

function date2Str(d) {
    var d = new Date(d);
    return lz(d.getDate()) + '.'
        + lz(d.getMonth()+1) + ' '
        + lz(d.getHours()) + ':'
        + lz(d.getMinutes()) + ':'
        + lz(d.getSeconds());
}

function ms2str(ms) {
    if (!(typeof ms == 'number' && ms >= 0)) {
        return 'Error!';
    }
    var ss = Math.floor(ms / 1000);
    if (ss < 60) {
        return lz(ss) + ' sec';
    }
    var mm = Math.floor(ss / 60);
    ss = ss - (mm * 60);
    if (mm < 60) {
        return lz(mm) + ':' + lz(ss) + ' min';
    }
    var hh = Math.floor(mm / 60);
    mm = mm - (hh * 60);
    if (hh < 24) {
        return lz(hh) + ':' + lz(mm) + ':' + lz(ss);
    }
    return Math.floor(hh / 24) + ' day(s)';
}

function StoredObj(sn, defs){
    var storageName = sn === undefined ? 'myStorage' : sn;
    this.save = function(){
        localStorage[storageName] = JSON.stringify(this);
    }
    if (localStorage.getItem(storageName) !== null) {
        var inObj = JSON.parse(localStorage[storageName]);
        for(var key in inObj){
            this[key] = inObj[key];
        }
    }
    if (typeof defs === 'object') {
        for(var key in defs){
            this[key] = this[key] === undefined ? defs[key] : this[key];
        }
        this.save();
    };
}

});
$(window).load(function(){

var $startBtn = $('#startBtn');
var $stopBtn = $('#stopBtn');
var $resetBtn = $('#resetBtn');
var $totalCount = $('#totalCount');
var $count = $('#count');
var $startTime = $('#startTime');
var $timer = $('#timer');
var $savedTimes = $('#savedTimes');

if (localStorage.getItem('totalCount') !== null) {
    var totalCount = +localStorage['totalCount'];
} else {
    var totalCount = 0;
};

if (localStorage.getItem('stDate') !== null) {
    var stDate = new Date(+localStorage['stDate']);
    var running = true;
    $stopBtn.show();
    $startBtn.hide();
    $count.show();
    $startTime.text(date2str(stDate));
} else {
    var stDate = new Date();
    var running = false;
    $stopBtn.hide();
    $startBtn.show();
    $count.hide();
    $totalCount.text(ms2str(totalCount));
};

if (localStorage.getItem('savedTimes') !== null) {
    var savedTimes = JSON.parse(localStorage['savedTimes']);
    displaySavedTimes();
} else {
    var savedTimes = [];
};

setInterval(tick, 1000);
tick();

$(document).keyup(function(event){
    if (event.keyCode == 27 && running) {
        stopTimer();
    }

    if (event.keyCode == 13 && !running) {
        startTimer();
    }
 });

$startBtn.click(startTimer);

$stopBtn.click(stopTimer);

$resetBtn.click(function(){
    running = false;
    totalCount = 0;
    stDate = new Date();
    savedTimes = [];
    $stopBtn.hide();
    $startBtn.show();
    $count.hide();
    $totalCount.text('00 sec');
    $savedTimes.empty();
    localStorage.clear();
    return false;
});

function tick(){
    if (running) {
        var d = new Date();
        $timer.text(date2str(d));
        $totalCount.text(ms2str(totalCount + (d - stDate)));
    }
}

function startTimer() {
    stDate = new Date();
    $startTime.text(date2str(stDate));
    running = true;
    tick();
    $count.show();
    $stopBtn.show();
    $startBtn.hide();
    localStorage['stDate'] = +stDate;
    return false;
}

function stopTimer() {
    $count.hide();
    running = false;
    var d = new Date();
    savedTimes.unshift([+stDate, +d]);
    localStorage['savedTimes'] = JSON.stringify(savedTimes);
    displaySavedTimes();
    $stopBtn.hide();
    $startBtn.show();
    localStorage.removeItem('stDate');
    return false;
}

function displaySavedTimes() {
    var p = '';
    var t = 0;
    var s = '<div class="stLine row">';
    s += '<div class="col-xs-4 text-right">';
    s += '<span class="badge">%s</span></div>';
    s += '<div class="col-xs-4 lead text-nowrap">%s - %s</div>';
    s += '<div class="col-xs-4">';
    s += '<a class="e btn btn-success btn-xs">';
    s += '<span class="glyphicon glyphicon-pencil">';
    s += '</span></a> <a class="x btn btn-danger btn-xs">';
    s += '<span class="glyphicon glyphicon-remove">';
    s += '</span></a></div></div>';

    for(var i=0; i<savedTimes.length; i++) {
        p = p + sprintf(s, ms2str(savedTimes[i][1] - savedTimes[i][0]),
            date2str(savedTimes[i][0]), date2str(savedTimes[i][1]));
        t = t + savedTimes[i][1] - savedTimes[i][0];
    }
    totalCount = t;
    localStorage['totalCount'] = totalCount;
    $totalCount.text(ms2str(totalCount));
    tick();
    $savedTimes.html(p);

    $('.e').click(function() {
        var $stLine = $(this).parent().parent();
        var n = $(".stLine").index($stLine);
        var stMin = (n < savedTimes.length - 1) ?
            savedTimes[n+1][1] :
            (savedTimes[n][0] - 3600000);
        var stMax = (n <= 0) ?
            (running ? stDate : (new Date())) :
            savedTimes[n-1][0];
        var sliderMin = savedTimes[n][0];
        var sliderMax = savedTimes[n][1];
        var s = '<div class="col-xs-8 text-center">';
        s += '<input id="theSlider" type="text" value="" />';
        s += '</div>';
        s += '<div class="col-xs-4">';
        s += '<a id="okBtn" class="btn btn-xs btn-success">';
        s += '<span class="glyphicon glyphicon-ok">';
        s += '</span> Ok</a> ';
        s += '<a id="cancelBtn" class="btn btn-xs btn-danger">';
        s += '<span class="glyphicon glyphicon-remove">';
        s += '</span> Cancel</a>';
        s += '</div>';

        $('.e, .x').hide();

        $stLine.html(s).addClass('well');

        $("#theSlider").slider({
            min: stMin,
            max: stMax,
            value: [savedTimes[n][0], savedTimes[n][1]],
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
                savedTimes.splice(n,1);
            } else {
                savedTimes[n] = [sliderMin, sliderMax];
            };
            localStorage['savedTimes'] = JSON.stringify(savedTimes);
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
        var n = $(".stLine").index($(this).parent().parent());
        savedTimes.splice(n,1);
        localStorage['savedTimes'] = JSON.stringify(savedTimes);
        displaySavedTimes();
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

});
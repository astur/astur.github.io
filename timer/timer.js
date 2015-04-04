$(window).load(function(){

if (localStorage.getItem('totalCount') !== null) {
    var totalCount = +localStorage['totalCount'];
} else {
    var totalCount = 0;
};

if (localStorage.getItem('stDate') !== null) {
    var stDate = new Date(+localStorage['stDate']);
    var running = true;
    $('#stopBtn').show();
    $('#startBtn').hide();
    $('#count').show();
    $('#startTime').text(date2str(stDate));
} else {
    var stDate = new Date();
    var running = false;
    $('#stopBtn').hide();
    $('#startBtn').show();
    $('#count').hide();
    $('#totalCount').text(ms2str(totalCount));
};

if (localStorage.getItem('savedTimes') !== null) {
    $('#savedTimes').html(localStorage['savedTimes']);
};

$(document).keyup(function(event){
    if (event.keyCode == 27 && running) {
        stopTimer();
    }
    
    if (event.keyCode == 13 && !running) {
        startTimer();
    }
});

$('#startBtn').click(startTimer);

$('#stopBtn').click(stopTimer);

$('#resetBtn').click(function(){
    running = false;
    totalCount = 0;
    stDate = new Date();
    $('#stopBtn').hide();
    $('#startBtn').show();
    $('#count').hide();
    $('#totalCount').text('00 sec');
    $('#savedTimes').empty();
    localStorage.clear();
    return false;
});

setInterval(tick, 1000);
tick();

function tick(){
    if (running) {
        var d = new Date();
        $('#timer').text(date2str(d));
        $('#totalCount').text(ms2str(totalCount + (d - stDate)));
    }
}

function startTimer() {
    stDate = new Date();
    $('#startTime').text(date2str(stDate));
    running = true;
    tick();
    $('#count').show();
    $('#stopBtn').show();
    $('#startBtn').hide();
    localStorage['stDate'] = +stDate;
    return false;
}

function stopTimer() {
    $('#count').hide();
    var d = new Date();
    var t = '<p>[<i>' + ms2str(d - stDate) + '</i>] '
           + date2str(stDate)
           + ' - ' + date2str(d) + '</p>';
    $('#savedTimes').prepend(t);
    localStorage['savedTimes'] = $('#savedTimes').html();
    totalCount += (d - stDate);
    localStorage['totalCount'] = totalCount;
    $('#totalCount').text(ms2str(totalCount));
    $('#stopBtn').hide();
    $('#startBtn').show();
    running = false;
    localStorage.removeItem('stDate');
    return false;
}

function lz(t) {
    return (t < 10) ? '0' + t : '' + t;
}

function date2str(d) {
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
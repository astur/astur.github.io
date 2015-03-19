$(window).load(function(){
    
var stDate = new Date();
var todayCount = 0;
$('#stopBtn').hide();
setInterval(tick, 1000);

function tick(){
    var d = new Date();
    $('#timer').text(date2str(d));
    if ($('#stopBtn').is(':visible')) {
        $('#todayCount').text(ms2str(todayCount + (d - stDate)));
    }
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
    if (!(typeof ms == 'number' && ms > 0)) {
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

$('#startBtn').click(function () {
    stDate = new Date();
    var t = '<p>'
          + date2str(stDate)
          + ' - <span id="timer"></span></p>';
    $(t).addClass("count").prependTo('#savedTimes');
    tick();
    $('a').toggle();
    return false;
});

$('#stopBtn').click(function () {
    var d = new Date();
    var t = '[<i>' + ms2str(d - stDate) + '</i>] '
           + date2str(stDate)
           + ' - ' + date2str(d);
    $('#timer').remove();
    $('.count').empty().append(t).removeClass('count');
    todayCount += (d - stDate);
    $('#todayCount').text(ms2str(todayCount));
    $('a').toggle();
    return false;
});

});
/*
 user interface stuff for the web audio module player
 (c) 2012-2013 firehawk/tda
 updated by med^mandarine
 */
var notelist = new Array("C-", "C#", "D-", "D#", "E-", "F-", "F#", "G-", "G#", "A-", "A#", "B-");

function notef(n, s, c, d, cc) {

    var cmd = noZero(c.toString(16) + hb(d));
        cmd = cmd!=''  ? '<span class="command">' + cmd + '</span>' : '...';
    if (cc < 8)
        return (n ? ('<span class="note">' + notelist[n % 12] + Math.floor(1 + n / 12) + ' </span>') : ('... ')) +
                (s ? ('<span class="sample">' + hb(s) + "</span> ") : (".. ")) +
                cmd+"|";
    if (cc < 12)
        return (n ? ('<span class="note">' + notelist[n % 12] + Math.floor(1 + n / 12) + '</span>') : ('...')) +
                (s ? ('<span class="sample">' + hb(s) + '</span>') : ('..')) +
                cmd+'|';
    return (n ? ('<span class="note">' + notelist[n % 12] + Math.floor(1 + n / 12) + '</span>') :
            (s ? ('.<span class="sample">' + hb(s) + '</span>') :
                    (c & d ? (cmd) : ('...')))
            );
}

function noZero(n)
{
    return (n!='000') ? n : '';
}

function dec(n)
{
    var s = parseInt(n);
    return (String(s).length == 1) ? '0' + String(s) : s;
}

function hb(n) {
    var s = n.toString(16);
    if (s.length == 1) s = '0' + s;
    return s;
}

function pad(s, l) {
    var ps = s;
    if (ps.length > l) ps = ps.substring(0, l - 1);
    while (ps.length < l) ps += " ";
    return ps;
}
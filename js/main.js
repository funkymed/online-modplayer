/**
 * Modplayer By Cyril Pereira aka med^mandarine
 * cyril.pereira@gmail.com
 * with the player routine Protracker Javascript by Jani Halme
 * added some improvement, like visualizer, requestanimation, and transport detection
 * and this object to control everything
 *  - uploader
 *  - controler
 *  - design
 */
var modplayer = {
    player:null,
    playNow:'',
    timer:null,
    oldpos:-1,
    init:false,
    display:{
        analyzer:true,
        samples:true,
        patterns:true
    },
    currentData:{
        sample:null
    },
    u:'',
    isplaying:false,
    filterStrength:20,
    frameTime:0,
    lastLoop:new Date,
    thisLoop:null,
    initialize:function()
    {
        //"use asm";
        this.u = this.getURLParameter();
        this.u = decodeURIComponent(this.u);

        $('#loader').hide();
        $('#progressbar').hide();

        this.player = new Protracker();

        this.player.setautostart(true);
        this.player.setseparation(true);
        this.player.setamigatype(true);

        this.player.onReady = this.onReady;
        this.player.onPlay = this.onPlay;
        this.player.onStop = this.onStop;
        this.player.onProgress = this.onProgress;
        $('.btnrefresh').on('click',function(e)
        {
            e.preventDefault();
            modplayer.uploadedmod();
        });
        $('.files a,.controls a').on('click',function(e)
        {
            e.preventDefault();
            switch($(this).data('action'))
            {
                case "play":  modplayer.player.play(); break;
                case "pause": modplayer.player.pause(); break;
                case "stop":  modplayer.player.stop(); break;
                case "upload": break;
            }
        });

        $('.options a').on('click',function(e)
        {
            e.preventDefault();
            var i = $(this).find('i');
            if(i.hasClass('icon-eye-open'))
            {
                i.removeClass('icon-eye-open');
                i.addClass('icon-eye-close');
            }else{
                i.removeClass('icon-eye-close');
                i.addClass('icon-eye-open');
            }
            var bool = i.hasClass('icon-eye-open') ? true : false;
            switch($(this).data('action'))
            {
                case "FX":
                    if($('#modpattern, #canvas, #modsamples').hasClass('FX'))
                    {
                        $('#modpattern, #canvas, #modsamples').removeClass('FX');
                    }else{
                        $('#modpattern, #canvas, #modsamples').addClass('FX');
                    }
                    break;
                case "patterns": modplayer.display.patterns = bool; break;
                case "samples": modplayer.display.samples = bool; break;
                case "analyzer": modplayer.display.analyzer = bool; break;
            }
        });

        this.loop();
        this.viewFPS();

        //Vumeter
        this.canvas = document.getElementById('canvas');
        this.canvas.width = $('#modpattern').width();
        this.canvas.height = 120;

        this.ctx = canvas.getContext('2d');

        modplayer.select();
        this.uploadedmod();
        this.initupload();
    },
    getURLParameter:function () {
        return (location.href.split('#')[1]) ? 'mods/'+location.href.split('#')[1] : '';
    },
    uploadedmod:function()
    {
        $('#loader').show();
        $.ajax('list.php',{
            complete:function(e)
            {
                $('#loader').hide();
                var list = JSON.parse(e.responseText);
                var _h = '<li class="nav-header">Uploaded</li>';
                for(var i in list)
                {
                    if(modplayer.playNow==list[i])
                    {
                        _h+='<li class="active"><a href="#" data-action="load" data-filename="'+list[i]+'"><i class="icon-play"></i>'+list[i].replace('mods/','')+'</a></li>';
                    }else{
                        _h+='<li><a href="#" data-action="load" data-filename="'+list[i]+'">'+list[i].replace('mods/','')+'</a></li>';
                    }
                }
                $('.uploaded').html(_h);




                $('.uploaded a').off('click');
                $('.uploaded a').on('click',function(e)
                {
                    e.preventDefault();
                    $(this).blur();
                    modplayer.select(this);
                    modplayer.load($(this).data('filename'));
                });

                if(!modplayer.init)
                {

                    setTimeout(function()
                    {
                        if($('.uploaded .active').length)
                        {
                             $('.uploaded').animate({scrollTop: $('.uploaded .active').position().top-$('.uploaded').position().top,easing:'easeInOut'}, 2000);
                        }
                    },1000);

                    if(modplayer.u!='')
                    {
                        $('.uploaded a').each(function()
                        {
                            if($(this).data('filename')==modplayer.u)
                            {
                                $(this).click();
                                var f = modplayer.u.replace('mods/','');
                                modplayer.loadFile('mods/'+encodeURIComponent(f));
                            }
                        });

                    }else{
                        var rand = Math.floor(Math.random()*$('.uploaded a').length);
                        var item = $('.uploaded a').eq(rand);
                        item.click();
                    }
                    modplayer.init = true;
                }


            }
        });

        

    },
    initupload:function(n)
    {
        $('#fileupload').fileupload({
            url:'upload.php',
            dataType: 'json',
            acceptFileTypes: /(\.|\/)(mod)$/i,
            add:function (e, data) {
                modplayer.select();
                $('#loader').show();
                data.submit();
            },
            done: function (e, data) {
                $('#loader').hide();
                modplayer.load(data._response.result.name);
                modplayer.uploadedmod();
            }
        });
    },
    select:function(n)
    {
        $('.uploaded li,.files li').removeClass('active');
        $('.uploaded a,.files a').find('i').remove();
        if(n)
        {
            $(n).parent().addClass('active');
            $(n).prepend('<i class="icon-play"></i>');
        }
    },
    load:function(url)
    {
        document.location.hash = "#"+encodeURIComponent(url.replace('mods/',''));
    },
    loadFile:function(url)
    {
        $('#loader').show();
        modplayer.oldpos=-1;
        modplayer.player.stop();
        modplayer.playNow = url;
        modplayer.player.load(url);
        $('#progressbar .bar').css('width',0);
        $('#progressbar').fadeIn();
    },
    onReady:function()
    {
        setTimeout(function()
        {
            $('#loader').hide();
            $('#progressbar').fadeOut(100);
        },800);

        var size = 14;
        if(modplayer.player.channels == 8){
            size = 12;
        }else if(modplayer.player.channels == 10){
            size = 10;
        }
        
        $('#modpattern').css('font-size',size+'px');

        $('#modtimer .songlen').text(dec(modplayer.player.songlen));

        var _html = '';
        var pdata="";

        $('title').html('Modplayer online in javascript : '+this.title);
        for(var i=0;i<31;i++){
            _html+= '<span class="samplelist" id="sample'+hb(i+1)+'">'+hb(i+1)+' '+pad(this.sample[i].name, 22)+'</span>\n';
        }
        $("#modsamples").html(_html);
        for(var p=0;p<this.patterns;p++) {

            var pp, pd='<div class="patterndata pattern'+hb(p)+'">';
            for(i=0; i<12; i++) pd+="\n";
            for(i=0; i<64; i++) {
                pp=i*4*this.channels;
                pd+='<span class="patternrow">'+dec(i)+'|';
                for(var c=0;c<this.channels;c++) {
                    pd+=notef(this.note[p][i*this.channels+c], (this.pattern[p][pp+0]&0xf0 | this.pattern[p][pp+2]>>4), this.pattern[p][pp+2]&0x0f, this.pattern[p][pp+3], this.channels);
                    pp+=4;
                }
                pd+="</span>\n";
            }
            for(i=0; i<24; i++) pd+="\n";
            pdata+=pd+"</div>";
        }
        $("#modpattern").html(pdata);
    },
    onPlay:function()
    {
        modplayer.isplaying = true;

    },
    onProgress:function(evt)
    {
        if (evt.lengthComputable)
        {
            $('#progressbar').fadeIn(100);
            var percentComplete = (evt.loaded / evt.total)*100;
            $('#progressbar .bar').css('width',percentComplete+'%');
        }
    },
    onStop:function()
    {
        modplayer.isplaying = false;
    },
    updateftps:function()
    {
        var thisFrameTime = (modplayer.thisLoop=new Date) - modplayer.lastLoop;
        modplayer.frameTime+= (thisFrameTime - modplayer.frameTime) / modplayer.filterStrength;
        modplayer.lastLoop = modplayer.thisLoop;
        modplayer.fps = (1000/modplayer.frameTime).toFixed(1);
    },
    viewFPS:function()
    {
        //requestAnimationFrame(modplayer.viewFPS);
        fpsOut.innerHTML = (1000/(modplayer ? modplayer.frameTime : 0)).toFixed(0) + " fps";
        setTimeout(modplayer.viewFPS,200);
    },
    loop:function()
    {

        requestAnimationFrame(modplayer.loop);
        modplayer.updateftps();
        if(!modplayer.isplaying)
            return;

        if (modplayer.player.paused)
            return;

        var mod=modplayer.player;
        var i,c;

        if(modplayer.display.analyzer)
        {
            modplayer.player.getAnalyser(modplayer.ctx,modplayer.canvas.width,modplayer.canvas.height);
        }

        if(modplayer.display.samples)
        {
            $("#modsamples").children().removeClass("activesample");
            c = mod.channels;
            while(c--)
            {
                var s = mod.channel[c].sample+1;
                if (mod.channel[c].noteon)
                {
                    $("#sample"+hb(s)).addClass("activesample");
                }
            }
        }

        if(modplayer.display.patterns)
        {
            document.getElementById('pos').innerHTML = dec(mod.position);
            document.getElementById('speed').innerHTML = mod.speed;
            document.getElementById('bpm').innerHTML = mod.bpm;
            document.getElementById('row').innerHTML = dec(mod.row);

            if (modplayer.oldpos != mod.position) {
                $(".currentpattern").removeClass("currentpattern");
                $(".pattern"+hb(mod.patterntable[mod.position])).addClass("currentpattern");
            }
            
            $(".currentrow").removeClass("currentrow");
            $(".currentpattern .patternrow:eq("+mod.row+")").addClass("currentrow");
            $(".currentpattern").scrollTop( mod.row * 16);
            
            modplayer.oldpos = mod.position;
        }
    }
};

window.requestAnimationFrame = (function(){
    return window.requestAnimationFrame  ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
})();

$(window).on('hashchange',function(){
    var u = modplayer.getURLParameter();
    modplayer.loadFile(u);
});

var fpsOut = document.getElementById('fps');
$('document').ready(function()
{
    modplayer.initialize();
});


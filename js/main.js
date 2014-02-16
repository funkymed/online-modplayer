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
var modplayer = function()
{
  this.initialize();
  var scope = this;
  $(window).on('hashchange',function(){
    var u = scope.getURLParameter();
    scope.loadFile(u);
  });
};
modplayer.prototype = {
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
    this.fpsOut = $('#fps');

    this.u = this.getURLParameter();
    this.u = decodeURIComponent(this.u);

    $('#loader').hide();
    $('#progressbar').hide();

    this.player = new Protracker();

    this.player.setautostart(true);
    this.player.setseparation(true);
    this.player.setamigatype(true);

    this.player.onReady    = $.proxy(this.onReady,this);
    this.player.onPlay     = $.proxy(this.onPlay,this);
    this.player.onStop     = $.proxy(this.onStop,this);
    this.player.onProgress = $.proxy(this.onProgress,this);

    var scope = this;
    $('.btnrefresh').on('click',function(e)
    {
      e.preventDefault();
      scope.uploadedmod();
    });
    $('.files a,.controls a').on('click',function(e)
    {
      e.preventDefault();
      switch($(this).data('action'))
      {
        case "play":  scope.player.play(); break;
        case "pause": scope.player.pause(); break;
        case "stop":  scope.player.stop(); break;
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
          if($('#modpattern, #canvas').hasClass('FX'))
          {
            $('#modpattern, #canvas').removeClass('FX');
          }else{
            $('#modpattern, #canvas').addClass('FX');
          }
          break;
        case "patterns":  scope.display.patterns = bool; break;
        case "samples":   scope.display.samples = bool; break;
        case "analyzer":  scope.display.analyzer = bool; break;
      }
    });

    this.loop();
    this.viewFPS();

    //Vumeter
    this.canvas = document.getElementById('canvas');
    this.canvas.width = $('#modpattern').width();
    this.canvas.height = 120;

    this.ctx = canvas.getContext('2d');

    this.select();
    this.uploadedmod();
    this.initupload();
  },
  getURLParameter:function () {
    return (location.href.split('#')[1]) ? 'mods/'+location.href.split('#')[1] : '';
  },
  uploadedmod:function()
  {
    $('#loader').show();
    var scope =this;
    $.ajax('list.php',{
      complete:function(e)
      {

        $('#loader').hide();
        var list = JSON.parse(e.responseText);
        var _h = '<li class="nav-header">Uploaded</li>';
        for(var i in list)
        {
          if(this.playNow==list[i])
          {
            _h+='<li class="active"><a href="#" data-action="load" data-filename="'+list[i]+'"><i class="icon-play"></i>'+list[i].replace('mods/','')+'</a></li>';
          }else{
            _h+='<li><a href="#" data-action="load" data-filename="'+list[i]+'">'+list[i].replace('mods/','')+'</a></li>';
          }
        }

        $('.uploaded').html(_h);

        $('.uploaded a').off('click');

        $('.uploaded a').on('click', $.proxy(scope.selectTune,scope));


        if(!this.init)
        {
          setTimeout(function()
          {
            if($('.uploaded .active').length)
            {
              $('.uploaded').animate({scrollTop: $('.uploaded .active').position().top-$('.uploaded').position().top,easing:'easeInOut'}, 2000);
            }
          },1000);

          if(this.u!='')
          {
            $('.uploaded a').each(function()
            {
              if($(this).data('filename')==scope.u)
              {
                $(this).click();
                var f = scope.u.replace('mods/','');
                scope.loadFile('mods/'+encodeURIComponent(f));
              }
            });

          }else{
            var rand = Math.floor(Math.random()*$('.uploaded a').length);
            var item = $('.uploaded a').eq(rand);
            item.click();
          }
          this.init = true;
        }
      }
    });
  },
  selectTune:function(e)
  {
    e.preventDefault();

    $(e.target).blur();
    this.select(e.target);
    this.load($(e.target).data('filename'));
  },
  initupload:function(n)
  {
    var scope = this;
    $('#fileupload').fileupload({
      url:'upload.php',
      dataType: 'json',
      acceptFileTypes: /(\.|\/)(mod)$/i,
      add:function (e, data) {
        scope.select();
        $('#loader').show();
        data.submit();
      },
      done: function (e, data) {
        $('#loader').hide();
        scope.load(data._response.result.name);
        scope.uploadedmod();
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
    this.oldpos=-1;
    this.player.stop();
    this.playNow = url;
    this.player.load(url);
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

    if(this.player.channels == 8){
      size = 12;
    }else if(this.player.channels == 10){
      size = 10;
    }

    $('#modpattern').css('font-size',size+'px');

    $('#modtimer .songlen').text(dec(this.player.songlen));

    var _html = '';
    var pdata="";

    $('title').html('Modplayer online in javascript : '+this.title);
    for(var i=0;i<31;i++){
      _html+= '<span class="samplelist" id="sample'+hb(i+1)+'">'+hb(i+1)+' '+pad(this.player.sample[i].name, 22)+'</span>\n';
    }
    $("#modsamples").html(_html);
    for(var p=0;p<this.player.patterns;p++) {
      var pp, pd='<div class="patterndata pattern'+hb(p)+'">';
      for(i=0; i<12; i++) pd+="\n";
      for(i=0; i<64; i++) {
        pp=i*4*this.player.channels;
        pd+='<span class="patternrow">'+dec(i)+'|';
        for(var c=0;c<this.player.channels;c++) {
          pd+=notef(this.player.note[p][i*this.player.channels+c], (this.player.pattern[p][pp+0]&0xf0 | this.player.pattern[p][pp+2]>>4), this.player.pattern[p][pp+2]&0x0f, this.player.pattern[p][pp+3], this.player.channels);
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
    this.isplaying = true;

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
    this.isplaying = false;
  },
  updateftps:function()
  {
    var thisFrameTime = (this.thisLoop=new Date) - this.lastLoop;
    this.frameTime+= (thisFrameTime - this.frameTime) / this.filterStrength;
    this.lastLoop = this.thisLoop;
    this.fps = (1000/this.frameTime).toFixed(0);
  },
  viewFPS:function()
  {
    this.fpsOut.html(this.fps + " fps");
    setTimeout($.proxy(this.viewFPS, this), 400);
  },
  loop:function()
  {
    requestAnimationFrame($.proxy(this.loop, this));

    this.updateftps();
    if(!this.isplaying)
      return;

    if (this.player.paused)
      return;

    var c, mod=this.player;

    if(this.display.analyzer)
    {
      this.player.getAnalyser(this.ctx,this.canvas.width,this.canvas.height);
    }

    if(this.display.samples)
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

    if(this.display.patterns)
    {
      document.getElementById('pos').innerHTML    = dec(mod.position);
      document.getElementById('speed').innerHTML  = mod.speed;
      document.getElementById('bpm').innerHTML    = mod.bpm;
      document.getElementById('row').innerHTML    = dec(mod.row);

      if (this.oldpos != mod.position) {
        $(".currentpattern").removeClass("currentpattern");
        $(".pattern"+hb(mod.patterntable[mod.position])).addClass("currentpattern");
      }

      $(".currentrow").removeClass("currentrow");
      $(".currentpattern .patternrow:eq("+mod.row+")").addClass("currentrow");
      $(".currentpattern").scrollTop( mod.row * 16);

      this.oldpos = mod.position;
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

$('document').ready(function()
{
  new modplayer();
});


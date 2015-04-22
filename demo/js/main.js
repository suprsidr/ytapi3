'use strict';
$(document).foundation();
$(".headroom").headroom({
  "tolerance": 5,
  "offset": 205,
  "classes": {
    "initial": "",
    "pinned": "headroom--pinned",
    "unpinned": "headroom--unpinned",
    "top": "",
    "notTop": ""
  }
});

$('button.player').fancybox({
    openEffect: 'none',
    closeEffect: 'none',
    helpers: {
        media: true
    },
    width: 853,
    height: 480,
    aspectRatio: true,
    scrolling: 'no',
    beforeLoad: function(){
      if($('.touch').length == 0){
        $('video').get(0).pause();
      }
    }
});
/*
$('button.player').on('click', function(e){
  e.preventDefault();
  $(this).hide();
  $('video')
  .on('play', function(e){
    $('.play-icon').hide();
    $('.pause-icon').show();
  })
  .on('pause', function(e){
    $('.pause-icon').hide();
    $('.play-icon').show();
  })
  .attr({'src': 'video/vid1.mp4'})
  .append($('source').attr({'type': 'video/mp4', 'src': 'video/vid1.mp4'}))
  .get(0).play();
});*/
$('.play-icon').on('click', function(e){
  $('video').get(0).play();
});
$('.pause-icon').on('click', function(e){
  $('video').get(0).pause();
});

$('.sub-nav a').on('click', function(e){
  e.preventDefault();
  $(this).parent().siblings('.active').removeClass('active').end().addClass('active');
  $('.sub-section').hide();
  $($(this).attr('href')).show();
});

$('form[action^="http://em.horizonhobby.com"]').on('click', function(e) {
  e.preventDefault();
  if(!validateEmail($('input[type="email"]').val())) {
    $('input[type="email"]').addClass('error').get(0).focus();
  } else {
    this.submit();
  }
})

$(document).ready(function(){
  $('.sub-section').not('#overview').hide();
  if($('.touch').length == 0){
    $('video').attr('src', $('video').data('clip'))
    .on('play', function(e){
      $('.play-icon').hide();
      $('.pause-icon').show();
    })
    .on('pause', function(e){
      $('.pause-icon').hide();
      $('.play-icon').show();
    });
  }
  $(window).trigger('resize');
  
})

$(window)
.on('resize', debounce(function(e){
  $('.copy-section').css('min-height', $(window).height() - ($('#signup').height() + $('footer').height()) - 90);
}, 250));

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
    

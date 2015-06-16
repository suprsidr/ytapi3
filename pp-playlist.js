// pp-playlists
(function($) {
  if ($('.pp-playlist').length) {
    var tmpl = '<div class="row"><div class="large-12 medium-12 small-12 columns iframe-container"><iframe frameborder="0" allowfullscreen></iframe></div></div><div class="row"><div class="large-12 medium-12 small-12 columns desc-container under"></div></div><div class="row control-bar" style="display: none"><div class="large-4 medium-12 small-12 columns channel-container"><div class="channel-selector"><h5 class="current-channel"></h5><ul class="sub-menu"></ul></div></div><div class="large-4 medium-6 small-12 columns playlist-container"><h6 class="msg"></h6></div><div class="large-4 medium-6 small-12 columns button-container text-center"><div class="row collapse search-container"><div class="small-10 columns"><input class="search-box" type="text" placeholder="Search this channel"></div><div class="small-2 columns"><a class="button postfix" href="#search">Go</a></div></div></div></div><div class="row"><div class="large-12 medium-12 small-12 columns thumbs-list-container"><a class="prev-arrow"></a><a class="next-arrow"></a><ul class="small-block-grid-2 medium-block-grid-5 large-block-grid-5 thumbs-list"></ul></div></div>';
    $("<link/>", {
      rel : "stylesheet",
      type : "text/css",
      href : "/media/styles/ytapi3.min.css"
    }).appendTo("head");
    $.ajax({
      url : '/media/scripts/jquery.ytapi3.min.js',
      cache : true,
      dataType : "script",
      success : function() {
        $('.pp-playlist').each(function() {
          $(this).removeClass('pp-playlist').addClass('small-12 columns yt-plugin').html(tmpl).ytapi3({
            key : 'AIzaSyDKzdYCBqdtu0F8oAh2GPB4K2RExdyUzkA',
            maxResults : 5,
            playlist : [{
              name : 'Video Playlist',
              id : $(this).data('list-id'),
              type : 'playlistid'
            }],
            urlParams : '?theme=light&autoplay=0&wmode=opaque&rel=0'
          });
        })
      }
    });
  }
})(window.jQuery); 



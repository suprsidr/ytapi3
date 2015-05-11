;(function($, window, document, undefined) {

  // Create the defaults once
  var pluginName = 'ytapi3', defaults = {
    username : '',//'HorizonHobbyProducts',
    key : '',//'AIzaSyDKzdYCBqdtu0F8oAh2GPB4K2RExdyUzkA',
    earl : 'https://www.googleapis.com/youtube/v3',
    channelId : '',
    videoList: '',
    playlist: [],
    uploadsPlaylistId : '',
    currentPlaylistId : '',
    currentItems : [],
    currentPlaylistItems : [],
    currentQuery : '',
    maxResults : 10,
    showChannelPlaylists: true,
    urlParams: '?theme=light&autoplay=1&wmode=opaque&rel=0'
  };

  // The actual plugin constructor
  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.thumbList = this.element.find('.thumbs-list');
    this.iframe = this.element.find('iframe');
    this.descContainer = this.element.find('.desc-container');
    this.channelContainer = this.element.find('.channel-container');
    this.currentChannel = this.channelContainer.find('.current-channel');
    this.prevArrow = this.element.find('.prev-arrow');
    this.nextArrow = this.element.find('.next-arrow');
    this.controlBar = this.element.find('.control-bar');
    this.searchBox = this.element.find('.search-box');
    this.searchContainer = this.element.find('.search-container');
    this.msg = this.element.find('.msg');
    this.isTouch = false;
    this.init();
  }


  Plugin.prototype = {
    init : function() {
      var self = this;
      if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        $('html').addClass('touch');
        self.isTouch = true;
      }
      // Add expected elements
      this.descContainer.append('<h4 /><p />');
      // Setup our list
      if(this.options.videoList.length) {
        this.getVideoItems(this.options.videoList);
      } else if(this.options.playlist.length) {
        $.each(this.options.playlist, function(){
          self.channelContainer.find('.sub-menu').append(
            $('<li />').append(
              $('<a />')
                .attr('href', this.name)
                .addClass(this.type)
                .data(this.type, this.id)
                .text(this.name)
                .on('click', function(e) {
                  e.preventDefault();
                  var data = $(this).data();
                  if(data.channelid){
                    self.getId(data.channelid);
                    if($('.lt-ie9').length > 0) {
                      self.searchBox.val('Search this channel');
                    } else {
                      self.searchBox.val('');
                    }
                    self.currentChannel.html('<span class="channelid">' +  $(this).text() + '</span>');
                    self.searchContainer.show();
                  } else if(data.playlistid) {
                    self.getPlaylistItems(data.playlistid);
                    if($('.lt-ie9').length > 0) {
                      self.searchBox.val('Search this channel');
                    } else {
                      self.searchBox.val('');
                    }
                    self.currentChannel.html('<span class="playlistid">' +  $(this).text() + '</span>');
                    self.searchContainer.hide();
                    if(self.playlistSelector) {
                      self.playlistSelector.find('.sub-menu').empty().end().hide();
                    }
                  }
                })
            )
          );
        });
      }
      // listen to our events on our root element
      this.element.on('click', '.more', function(e) {
        e.preventDefault();
        $(this).hide('slow').parent().removeClass('has-more');
      }).on('click', 'a[href="#search"]', function(e) {
        e.preventDefault();
        self.getSearchItems(self.element.find('.search-box').val());
      }).on('keyup', '.search-box', function(e) {
        e.preventDefault();
        if (e.keyCode === 13) {
          self.element.find('a[href="#search"]').trigger('click');
        }
      });
      if($('.lt-ie9').length > 0) {
        this.searchBox.get(0).value = 'Search this channel';
        this.searchBox.on('focus', function() {
          if(this.value === 'Search this channel') {
            this.value = '';
          }
        }).on('blur', function() {
          if(this.value === '') {
            this.value = 'Search this channel';
          }
        });
      }
      if(this.options.playlist.length > 0) {
        this.channelContainer.find('.sub-menu a').first().trigger('click');
      } else if(this.options.username !== '') {
        this.getId(this.options.username);
      }
    },
    getId: function(username){
      var self = this, data = {
        part: 'id, contentDetails',
        forUsername: username,
        key: self.options.key,
        maxResults: this.options.maxResults
      };
      $.ajax({
        url: self.options.earl + '/channels',
        data: data,
        dataType: 'jsonp'
      }).done(function(data){
        //console.log('getId', data);
        if(data.items && data.items[0].id){
          self.options.channelId = data.items[0].id;
          self.options.uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
          self.getPlaylistItems(self.options.uploadsPlaylistId);
          if(self.options.showChannelPlaylists) {
            if(self.element.find('.playlist-selector').length === 0 ) {
              self.playlistSelector = $('<div />')
                .addClass('playlist-selector')
                .append($('<h5 />')
                  .addClass('current-playlist'))
                .append($('<ul />')
                  .addClass('sub-menu')
                );
              self.controlBar.find('> div:nth-of-type(2)').append(self.playlistSelector);
            }
            self.playlistSelector.show();
            self.getPlaylists();
          }
        }
      }).fail(function(e){
        console.log('error', e);
      });
    },
    getPlaylistItems: function(playlistId, token){
      var self = this, data = {
        part: 'snippet,contentDetails',
        key: self.options.key,
        playlistId: playlistId,
        maxResults: self.options.maxResults,
        order: 'date', // rating, relevance, title, videoCount and viewCount
        pageToken: token || ''
      };
      self.options.currentPlaylistId = playlistId;
      $.ajax({
        url : self.options.earl + '/playlistItems',
        data: data,
        dataType : 'jsonp'
      })
      .done(function(data) {
        //console.log('getPlaylistItems', data);
        if(data.items && data.items.length > 0){
          $.each([self.prevArrow, self.nextArrow], function(){$(this).hide();});
          self.options.currentItems = data.items;
          self.thumbList.empty();
          $.each(data.items, function(i, obj){
            self.thumbList
            .append(
              $('<li />')
              .append($('<a />')
                .attr('href', obj.contentDetails.note || obj.snippet.title)
                .data('index', i)
                .append($('<img />')
                  .attr('src', obj.snippet.thumbnails.medium.url))
                .on('click', function(e){
                  e.preventDefault();
                  if(obj.snippet.description.length > 300) {
                    self.descContainer.find('h4').text(obj.contentDetails.note || obj.snippet.title)
                    .end().find('p').addClass('has-more').html(self.filterText(obj.snippet.description) + '<a href="more" class="more">Read More...</a>');
                  } else {
                    self.descContainer.find('h4').text(obj.contentDetails.note || obj.snippet.title)
                    .end().find('p').html(self.filterText(obj.snippet.description));
                  }
                  self.iframe.attr('src', '//www.youtube.com/embed/' + obj.contentDetails.videoId + self.options.urlParams);
                })
              )
              .append($('<p />')
                .text(obj.contentDetails.note || obj.snippet.title))
            );
          });
          if(self.iframe.attr('src') === undefined) {
            self.thumbList.find('a').first().trigger('click');
          }
          if(data.prevPageToken) {
            self.prevArrow.show().off().on('click', function(e){
              e.preventDefault();
              self.getPlaylistItems(self.options.currentPlaylistId, data.prevPageToken);
            });
          }
          if(data.nextPageToken) {
            self.nextArrow.show().off().on('click', function(e){
              e.preventDefault();
              self.getPlaylistItems(self.options.currentPlaylistId, data.nextPageToken);
            });
          }
        } else {
          self.displayMsg('Sorry, no items found for this query.');
        }
      })
      .fail(function(e) {
        console.log('error', e);
      });
    },
    getVideoItems: function(videoList){
      var self = this, data = {
        id: videoList,
        part: 'snippet',
        key: self.options.key
      };
      $.ajax({
        url : self.options.earl + '/videos',
        data: data,
        dataType : 'jsonp'
      })
      .done(function(data) {
        //console.log('getVideoItems', data);
        if(data.items && data.items.length > 0){
          $.each([self.prevArrow, self.nextArrow], function(){$(this).hide();});
          self.options.currentItems = data.items;
          self.thumbList.empty();
          $.each(data.items, function(i, obj){
            self.thumbList
            .append(
              $('<li />')
              .append($('<a />')
                .attr('href', obj.snippet.title)
                .data('index', i)
                .append($('<img />')
                  .attr('src', obj.snippet.thumbnails.medium.url))
                .on('click', function(e){
                  e.preventDefault();
                  if(obj.snippet.description.length > 300) {
                    self.descContainer.find('h4').text(obj.snippet.title)
                    .end().find('p').addClass('has-more').html(self.filterText(obj.snippet.description) + '<a href="more" class="more">Read More...</a>');
                  } else {
                    self.descContainer.find('h4').text(obj.snippet.title)
                    .end().find('p').html(self.filterText(obj.snippet.description));
                  }
                  self.iframe.attr('src', '//www.youtube.com/embed/' + obj.id + self.options.urlParams);
                })
              )
              .append($('<p />')
                .text(obj.snippet.title))
            );
          });
          if(self.iframe.attr('src') === undefined) {
            self.thumbList.find('a').first().trigger('click');
          }
          if(data.prevPageToken) {
            self.prevArrow.show().off().on('click', function(e){
              e.preventDefault();
              self.getPlaylistItems(self.options.currentPlaylistId, data.prevPageToken);
            });
          }
          if(data.nextPageToken) {
            self.nextArrow.show().off().on('click', function(e){
              e.preventDefault();
              self.getPlaylistItems(self.options.currentPlaylistId, data.nextPageToken);
            });
          }
        } else {
          self.displayMsg('Sorry, no items found for this query.');
        }
      })
      .fail(function(e) {
        console.log('error', e);
      });
    },
    getSearchItems: function(query, token){
      var self = this, data = {
        part: 'snippet',
        key: self.options.key,
        q: query,
        channelId: self.options.channelId,
        maxResults: self.options.maxResults,
        order: 'date', // rating, relevance, title, videoCount and viewCount
        pageToken: token || null
      };
      self.options.currentQuery = query;
      $.ajax({
        url : self.options.earl + '/search',
        data: data,
        dataType : 'jsonp'
      })
      .done(function(data) {
        //console.log('getSearchItems', data);
        if(data.items && data.items.length > 0){
          $.each([self.prevArrow, self.nextArrow], function(){$(this).hide();});
          self.options.currentItems = data.items;
          //$('.msg').text(data.pageInfo.totalResults + ' results').show('slow');
          self.thumbList.empty();
          $.each(data.items, function(i, obj){
            self.thumbList
            .append(
              $('<li />')
              .append($('<a />')
                .attr('href', obj.snippet.title)
                .data('index', i)
                .append($('<img />')
                  .attr('src', obj.snippet.thumbnails.medium.url))
                .on('click', function(e){
                  e.preventDefault();
                  if(obj.snippet.description.length > 300) {
                    self.descContainer.find('h4').text(obj.snippet.title)
                    .end().find('p').addClass('has-more').html(self.filterText(obj.snippet.description) + '<a href="more" class="more">Read More...</a>');
                  } else {
                    self.descContainer.find('h4').text(obj.snippet.title)
                    .end().find('p').html(self.filterText(obj.snippet.description));
                  }
                  self.iframe.attr('src', '//www.youtube.com/embed/' + obj.id.videoId + self.options.urlParams);
                })
              )
              .append($('<p />')
                .text(obj.snippet.title))
            );
          });
          if(self.iframe.attr('src') === undefined) {
            self.thumbList.find('a').first().trigger('click');
          }
          if(data.prevPageToken) {
            self.prevArrow.show().off().on('click', function(e){
              e.preventDefault();
              self.getSearchItems(self.options.currentQuery, data.prevPageToken);
            });
          }
          if(data.nextPageToken) {
            self.nextArrow.show().off().on('click', function(e){
              e.preventDefault();
              self.getSearchItems(self.options.currentQuery, data.nextPageToken);
            });
          }
      } else {
        self.displayMsg('Sorry, no items found for this query.');
      }
      })
      .fail(function(e) {
        console.log('error', e);
      });
    },
    getPlaylists: function(){
      var self = this, data = {
        part: 'snippet,contentDetails',
        key: self.options.key,
        channelId: self.options.channelId,
        maxResults: 50
      };
      this.element.find('.rt-arrow, .lt-arrow').hide();
      $.ajax( {
        url : self.options.earl + '/playlists',
        data: data,
        dataType : 'jsonp'
      })
      .done(function(data) {
        //console.log('getPlaylists', data);
        if(data.items.length > 0){
          self.options.currentPlaylistItems = data.items;
          self.controlBar.find('.playlist-selector .sub-menu').empty(); //self.options.uploadsPlaylistId
          data.items.unshift({
            id: self.options.uploadsPlaylistId,
            snippet: {
              title: 'Uploads'
            }
          });
          $.each(data.items, function(i, obj){
            if(i === 0) {
              self.playlistSelector.find('.current-playlist').html('<span class="playlistid">' +  obj.snippet.title + '</span>');
            }
            self.controlBar.find('.playlist-selector .sub-menu').append(
              $('<li />').append(
                $('<a />')
                  .attr('href', obj.snippet.title)
                  .addClass('playlistid')
                  .data('playlistid', obj.id)
                  .text(obj.snippet.title)
                  .on('click', function(e){
                    e.preventDefault();
                    var data = $(this).data();
                    self.getPlaylistItems(data.playlistid);
                    self.searchBox.val('');
                    self.playlistSelector.find('.current-playlist').html('<span class="playlistid">' +  $(this).text() + '</span>');
                    self.searchContainer.hide();
                    $(this).blur().closest('.playlist-selector').blur();
                  })
              )
            );
          });
        }
      })
      .fail(function(e) {
        console.log('error', e);
      });
    },
    filterText: function(txt) {
      return txt.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi, '<a href="$1" target="_blank">$1</a>');
    },
    displayMsg: function(txt) {
      var self = this;
      self.msg.text(txt).slideToggle('fast');
      setTimeout(function(){
        self.msg.slideToggle('fast');
      }, 3000);
    }
    // end functions
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      }
    });
  };

})(jQuery, window, document);

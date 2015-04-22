getPlaylists: function(token){ // I don't think this is how we'll want to display playlists
      var self = this, data = {
        part: 'snippet,contentDetails',
        key: self.options.key,
        channelId: self.options.channelId,
        pageToken: token || null
      };
      this.element.find('.rt-arrow, .lt-arrow').hide();
      $.ajax( {
        url : self.options.earl + '/playlists',
        data: data,
        dataType : 'jsonp'
      })
      .done(function(data) {
        console.log(data);
        if(data.items.length > 0){
          self.options.currentItems = data.items;
          $('.yt-thumbs-list').empty();
          $.each(data.items, function(i, obj){
            $('.yt-thumbs-list')
            .append(
              $('<li />')
              .append($('<a />')
                .attr('href', obj.snippet.title)
                .append($('<img />')
                  .attr('src', obj.snippet.thumbnails.medium.url))
                .on('click', function(e){
                  e.preventDefault();
                  self.getPlaylistItems(obj.id);
                })
              )
              .append($('<p />')
                .text(obj.snippet.title))
            );
          });
          if(data.prevPageToken) {
            self.element.find('.lt-arrow').show().off().on('click', function(e){
              e.preventDefault();
              self.getPlaylists(data.prevPageToken);
            });
          }
          if(data.nextPageToken) {
            self.element.find('.rt-arrow').show().off().on('click', function(e){
              e.preventDefault();
              self.getPlaylists(data.nextPageToken);
            });
          }
        }
      })
      .fail(function(e) {
        console.log('error', e);
      });
    },
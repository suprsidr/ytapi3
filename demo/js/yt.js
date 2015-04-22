/**
 * @author wpatterson
 */
'use strict';
(function(document, window, $, undefined){
  var settings = {
    username: 'HorizonHobbyProducts',
    key: 'AIzaSyA1kZAWsjbo2TBUwMBpq8zakPm4uOvqAJY',
    earl: 'https://www.googleapis.com/youtube/v3',
    channelId: '',
    uploadsPlaylistId: '',
    currentPlaylistId: '',
    currentItems: [],
    currentQuery: '',
    maxResults: 10
  }
  function getId(username){
    var data = {
      part: 'id, contentDetails',
      forUsername: settings.username,
      key: settings.key,
      maxResults: settings.maxResults
    };
    $.ajax({
      url: settings.earl + '/channels',
      data: data,
      dataType: 'jsonp'
    }).done(function(data){
      console.log(data);
      if(data.items[0].id){
        settings.channelId = data.items[0].id;
        settings.uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
        
        getPlayListItems(settings.uploadsPlaylistId);
        //getPlayLists();
      }
    }).fail(function(e){
      console.log('error', e);
    })
  }

  function getPlayLists(token){
    $('#prev-button, #next-button').hide();
    var data = {
      part: 'snippet,contentDetails',
      key: settings.key,
      channelId: settings.channelId,
      pageToken: token || null
    };
    $.ajax( {
      url : settings.earl + '/playlists',
      data: data,
      dataType : 'jsonp'
    })
    .done(function(data) {
      console.log(data);
      if(data.items.length > 0){
        settings.currentItems = data.items;
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
                getPlayListItems(obj.id)
              })
            )
            .append($('<p />')
              .text(obj.snippet.title))
          ) 
        })
        if(data.prevPageToken) {
          $('#prev-button').show().off().on('click', function(e){
            e.preventDefault();
            getPlayLists(data.prevPageToken);
          });
        }
        if(data.nextPageToken) {
          $('#next-button').show().off().on('click', function(e){
            e.preventDefault();
            getPlayLists(data.nextPageToken);
          });
        }
      }
    })
    .fail(function(e) {
      console.log('error', e)
    });
  }
  
  function getPlayListItems(playlistId, token){
    settings.currentPlaylistId = playlistId;
    $('#prev-button, #next-button, .msg').hide();
    var data = {
      part: 'snippet,contentDetails',
      key: settings.key,
      playlistId: settings.currentPlaylistId,
      maxResults: settings.maxResults,
      order: 'date', // rating, relevance, title, videoCount and viewCount
      pageToken: token || null
    };
    $.ajax( {
      url : settings.earl + '/playlistItems',
      data: data,
      dataType : 'jsonp'
    })
    .done(function(data) {
      console.log(data);
      if(data.items.length > 0){
        settings.currentItems = data.items;
        $('.yt-thumbs-list').empty();
        $.each(data.items, function(i, obj){
          $('.yt-thumbs-list')
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
                  $('.desc-container').find('h4').text(obj.contentDetails.note || obj.snippet.title)
                  .end().find('p').addClass('has-more').html(obj.snippet.description + '<a href="more" class="more">Read More...</a>');
                } else {
                  $('.desc-container').find('h4').text(obj.contentDetails.note || obj.snippet.title)
                  .end().find('p').html(obj.snippet.description);
                }
                $('.yt-plugin iframe').attr('src', '//www.youtube.com/embed/' + obj.contentDetails.videoId + '?theme=light&autoplay=1&wmode=opaque');
              })
            )
            .append($('<p />')
              .text(obj.contentDetails.note || obj.snippet.title))
          )
        })
        if($('.yt-plugin iframe').attr('src') == undefined) {
          $('.yt-thumbs-list a').first().trigger('click');
        }
        if(data.prevPageToken) {
          $('#prev-button').show().off().on('click', function(e){
            e.preventDefault();
            getPlayListItems(settings.currentPlaylistId, data.prevPageToken);
          });
        }
        if(data.nextPageToken) {
          $('#next-button').show().off().on('click', function(e){
            e.preventDefault();
            getPlayListItems(settings.currentPlaylistId, data.nextPageToken);
          });
        }
      } else {
        $('.msg').text('Sorry, no items found for this query.').show('slow');
      }
    })
    .fail(function(e) {
      console.log('error', e)
    });
  };
  
  function getSearchItems(query, token){
    settings.currentQuery = query;
    $('#prev-button, #next-button, .msg').hide();
    var data = {
      part: 'snippet',
      key: settings.key,
      q: settings.currentQuery,
      channelId: settings.channelId,
      maxResults: settings.maxResults,
      order: 'date', // rating, relevance, title, videoCount and viewCount
      pageToken: token || null
    };
    $.ajax( {
      url : settings.earl + '/search',
      data: data,
      dataType : 'jsonp'
    })
    .done(function(data) {
      console.log(data);
      if(data.items.length > 0){
        settings.currentItems = data.items;
        $('.msg').text(data.pageInfo.totalResults + ' results').show('slow');
        $('.yt-thumbs-list').empty();
        $.each(data.items, function(i, obj){
          $('.yt-thumbs-list')
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
                  $('.desc-container').find('h4').text(obj.snippet.title)
                  .end().find('p').addClass('has-more').html(obj.snippet.description + '<a href="more" class="more">Read More...</a>');
                } else {
                  $('.desc-container').find('h4').text(obj.snippet.title)
                  .end().find('p').text(obj.snippet.description);
                }
                $('iframe').attr('src', '//www.youtube.com/embed/' + obj.id.videoId + '?theme=light&autoplay=1&wmode=opaque');
              })
            )
            .append($('<p />')
              .text(obj.snippet.title))
          )
        })
        if($('.yt-plugin iframe').attr('src') == undefined) {
          $('.yt-thumbs-list a').first().trigger('click');
        }
        if(data.prevPageToken) {
          $('#prev-button').show().off().on('click', function(e){
            e.preventDefault();
            getSearchItems(settings.currentQuery, data.prevPageToken);
          });
        }
        if(data.nextPageToken) {
          $('#next-button').show().off().on('click', function(e){
            e.preventDefault();
            getSearchItems(settings.currentQuery, data.nextPageToken);
          });
        }
    } else {
      $('.msg').text('Sorry, no items found for this query.').show('slow');
    }
    })
    .fail(function(e) {
      console.log('error', e)
    });
  };
  
  $('.yt-plugin').on('click', '.sub-menu a', function(e){
    e.preventDefault();
    var data = $(this).data();
    if(data.channelid){
      getId(data.channelid);
      $('.current-channel').html('<span data-channelid>' +  $(this).text() + '</span>');
    } else if(data.playlist){
      getPlayListItems(data.playlist);
      $('.current-channel').html('<span data-playlist>' +  $(this).text() + '</span>');
    }
  }).on('click', '.more', function(e){
    e.preventDefault();
    $(this).hide('slow').parent().removeClass('has-more');
  }).on('click', 'a[href="#search"]', function(e){
    e.preventDefault();
    getSearchItems($('.yt-plugin .search-box').val());
  }).on('keyup', '.search-box', function(e) {
    e.preventDefault();
    if (e.keyCode == 13) {
      $('a[href="#search"]').trigger('click');
    }
  })
  
  getId('HorizonHobbyProducts');
  
  $(window).on('resize', function(){
    //$('.desc-container').css({'max-height': $('.iframe-container').height()});
  })
  
  $(document).ready(function(){
    $(window).trigger('resize');
  })
  
  
}(document, window, window.jQuery))


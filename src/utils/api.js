'use strict';


module.exports = {
  getPlaylist: function(camera) {
    let url;
    
    if (camera) {
      camera.streams.forEach(stream => {
        if (stream.playlist) {
          url = stream.playlist;
        }
      });
    }

    return url;
  },

  parseToken: function(token='') {
    const url = `https://int-cloudvms.solinkcloud.com/share/${token}`;
    return fetch(url).then(function(res) {
      return res.json();
    })  
  }
}

'use strict';


module.exports = {
  // testURL: 'http://www.streambox.fr/playlists/x36xhzz/x36xhzz.m3u8',//'http://10.126.140.241:3002/cameras/diIpZAXBUHGclUmC/video.m3u8?begin=1493611200000&end=1493697599000&stream=41d768ad-8044-4a73-87e2-d2d311e0ed30',

  getPlaylist: function(camera) {
    if (camera.id === 'diIpZAXBUHGclUmC') {
      let url = 'http://www.streambox.fr/playlists/test_001/stream.m3u8';

      camera.streams.forEach(stream => {
        if (stream.playlist) {
          url = stream.playlist;
        }
      });

      return url;

    } else if (camera.id === 'test2') {
      return 'http://www.streambox.fr/playlists/x36xhzz/x36xhzz.m3u8';
    } else if (camera.id === 'test3') {
      return 'http://www.streambox.fr/playlists/x31jrg1/x31jrg1.m3u8';
    } else if (camera.id === 'test4') {
      return 'http://www.streambox.fr/playlists/x212fsj/x212fsj.m3u8';
    }
    // return this.testURL;
  },

  parseToken: function(token='') {
    const url = `https://int-cloudvms.solinkcloud.com/share/${token}`;
    return fetch(url).then(function(res) {
      return res.json();
    })
  }
}

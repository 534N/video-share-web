import Settings from './settings';

module.exports = {
  getPlaylist: function(camera) {
    let url;
    
    if (camera && camera.streams) {
      camera.streams.forEach(stream => {
        if (stream.playlist) {
          url = stream.playlist;
        }
      });
    }

    return url;
  },

  parseToken: function(token='') {
    const url = `${Settings.cloud_vms_host}/share/${token}`;
    return fetch(url).then((res, err) => {
      return res.json();
    }).catch(err => {
      return { err: err };
    })
  }
}

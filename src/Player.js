import React, { Component } from 'react';
import Hls from 'connect-hls.js';
import './styles/Player.css';

export default class extends Component {
  componentDidMount() {
    this._initHLS(this.props.url);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.url !== prevProps.url) {
      this._initHLS(this.props.url);
    }
  }

  render() {
    return (
      <div className='video-wrap'>
        <video
          className='player'
          ref='player'
          src={this.props.url}
          autoPlay={true}
          controls={true} />
      </div>
    )
    
  }

  _initHLS(url) {
    const config = {
      xhrSetup: (xhr, url) => {
        xhr.withCredentials = true;
      },
      debug: false,
    };

    if (this.hls) {
      this.hls.destroy();
    }

    if (Hls.isSupported()) {
      const video = this.refs.player;
      this.hls = new Hls(config);
      this.hls.loadSource(url);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED,function() {
        video.play();
      });
    } 

  }

}
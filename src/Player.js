import React, { PureComponent } from 'react';
import Hls from 'connect-hls.js';
import VROverlay from './utils/vr-overlay/vr-overlay.react.js';
import './styles/Player.css';
import './utils/vr-overlay/sass/vr-overlay.css';

export default class extends PureComponent {
  componentDidMount() {
    this._initHLS(this.props.url);

    if (this.props.is360) {
      this._init360();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.url !== prevProps.url) {
      this._initHLS(this.props.url);
    }

    if (this.props.is360) {
      this._init360();
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
        { this.props.is360 && this._render360() }
      </div>
    )
  }

  _render360() {
    return (
      <VROverlay 
        ref='vrOverlay'
        togglePausePlay={this.props.togglePausePlay}
      />
    );
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

  _init360() {
    this.refs.vrOverlay.videoElementReady(this.refs.player);
  }
}
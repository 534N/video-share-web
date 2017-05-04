'use strict';

import React, { Component } from 'react';
// import Hls from 'forked.hls.js';
import Hls from 'hls.js';
import './Player.css';

export default class extends Component {
  constructor(props) {
    super(props);
  }

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
          autoPlay={false}
          width={`${this.props.width}px`}
          height={`${this.props.height}px`}
          controls={true} />
      </div>
    )
    
  }

  _initHLS(url) {
    const config = {
      autoStartLoad: false,
      debug: true,
      enableWorker: true,
      fragLoadingTimeOut: 60000,
    };

    const vid = this.refs.player;

    if (this.hls) {
      this.hls.destroy();
    }

    if (Hls.isSupported()) {
      const video = this.refs.player;
      this.hls = new Hls();
      this.hls.loadSource(url);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED,function() {
        // video.play();
      });
    } 

    // this.hls = new Hls(config);
    // this.hls.attachMedia(vid);

  }

}
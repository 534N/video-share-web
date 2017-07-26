import React, { Component } from 'react';
// import Hls from 'forked.hls.js';
import './styles/Camera.css';

export default class extends Component {
  render() {

    console.debug(this.props.camera)

    return (
      <div className='camera' data-active={this.props.active} data-inProgress={this.props.inProgress} onClick={this._cameraClick.bind(this, this.props.index)} >
        <div className='overlay' />
        <img alt='' src={this.props.camera.thumbnail} />
        {
          this.props.inProgress &&
          <div style={{fontSize: '12px'}}>Processing...</div>
        }
        <div className='camera-name flex-center'>
          {this.props.camera.name}
          <a download='just_a_test.mp4' href={this._getDownloadLink(this.props.camera)}>
            <i className='icon-button blue zmdi zmdi-cloud_download' />
          </a>
        </div>
      </div>
    )
    
  }

  _cameraClick(index) {
    this.props.onCameraChange(index);
  }

  _getDownloadLink(camera) {
    let url;
    
    if (camera && camera.streams) {
      camera.streams.forEach(stream => {
        if (stream.playlist) {
          url = stream.download;
        }
      });
    }

    return url;
  }

} 
import React, { Component } from 'react';
import CloudAPI from './utils/api.js'
import Tooltip from './Tooltip';
import './styles/Camera.css';

export default class extends Component {
  render() {
    const inProgress = !CloudAPI.getPlaylist(this.props.camera);
    const downloadURL = this._getDownloadLink(this.props.camera);


    return (
      <div className='camera' data-active={this.props.active} data-inProgress={inProgress} onClick={this._cameraClick.bind(this, this.props.index)} >
        <div className='overlay' >
          {
            inProgress &&
            <div className='banner' style={{fontSize: '12px'}}>Processing...</div>
          }
        </div>
        <img alt='' src={this.props.camera.thumbnail} />
        
        <div className='camera-name flex-center'>
          
          <Tooltip text={this.props.camera.name} width={downloadURL ? 100 : 140}/>
          {
            downloadURL &&
            <a download='just_a_test.mp4' href={downloadURL}>
              <i className='icon-button blue zmdi zmdi-cloud_download' />
            </a>
          }
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
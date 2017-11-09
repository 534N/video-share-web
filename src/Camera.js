import React, { PureComponent } from 'react';
import CloudAPI from './utils/api.js'
import Tooltip from './Tooltip';

import './styles/Camera.css';

export default class extends PureComponent {
  constructor(props) {
    super(props);

    this.is360 = /^360/.test(props.camera.name);
  }

  render() {
    const inProgress = !CloudAPI.getPlaylist(this.props.camera);
    const downloadURL = this._getDownloadLink(this.props.camera);


    return (
      <div className='camera' data-active={this.props.active} data-inProgress={inProgress} onClick={this._cameraClick.bind(this, this.props.index)} >
        <div className='overlay' >
          {
            this.is360 &&
            <div className='vr-banner'>
              <i className='zmdi zmdi-360vr' />
            </div>
          }
          {
            inProgress &&
            <div className='banner' style={{fontSize: '12px'}}>Processing...</div>
          }
          {
            !this.is360 && downloadURL &&
            <div className='download'>
              <a href={downloadURL}>
                <i className='icon-button white zmdi zmdi-download' />
              </a>
            </div>
          }
        </div>
        <img alt='' src={this.props.camera.thumbnail} />
        
        <div className='camera-name flex-center'>
          <Tooltip text={this.props.camera.name} />
        </div>
        {
          this.props.singleton &&
          <div className='singleton-download'>
            <a href={downloadURL}>
              <i className='icon-button blue zmdi zmdi-download' />
            </a>
          </div>
        }
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
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
        </div>
        <img alt='' src={this.props.camera.thumbnail} />
        
        <div className='camera-name flex-center'>
          <Tooltip text={this.props.camera.name} />
        </div>
      </div>
    )
  }

  _cameraClick(index) {
    this.props.onCameraChange(index);
  }

} 
import React, { PureComponent } from 'react';
import CloudAPI from './utils/api.js'
import Tooltip from './Tooltip';
import classNames from 'classnames';

import './styles/Camera.css';

export default class extends PureComponent {
  constructor(props) {
    super(props);

    this.totalSplits = 4;

    this.splitStyles = {
      'split-1': [
        {},
      ],
      'split-2': [
        { top: 0, left: 0, width: '50%' },
        { top: 0, left: '50%', width: '50%' },
      ],
      'split-3': [
        { top: 0, left: 0, width: '50%', height: '50%' },
        { top: 0, left: '50%', width: '50%', height: '50%' },
        { top: '50%', left: 0, width: '50%', height: '50%' },
      ],
      'split-4': [
        { top: 0, left: 0, width: '50%', height: '50%' },
        { top: 0, left: '50%', width: '50%', height: '50%' },
        { top: '50%', left: 0, width: '50%', height: '50%' },
        { top: '50%', left: '50%', width: '50%', height: '50%' },
      ],
    };

    this.splitPositions = {
      'split-1': [
        { lon: -180, lat: 30 },
      ],
      'split-2': [
        { lon: -180, lat: 30 },
        { lon: 1, lat: 30 },
      ],
      'split-3': [
        { lon: -180, lat: 30 },
        { lon: -60, lat: 30 },
        { lon: 60, lat: 30 },
      ],
      'split-4': [
        { lon: -180, lat: 30 },
        { lon: -90, lat: 30 },
        { lon: 1, lat: 30 },
        { lon: 90, lat: 30 },
      ],
    };

    this.is360 = /^360/.test(props.camera.name);

    this.state = {
      splits: 1
    };
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
              {
                this._renderSplits()
              }
            </div>
          }
          {
            inProgress &&
            <div className='banner' style={{fontSize: '12px'}}>Processing...</div>
          }
          {
            downloadURL &&
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

  _renderSplits() {
    let splitToggles = [];
    for (let i = 1; i <= this.totalSplits; i++) {
      const splitClass = classNames(
        'split',
        {
          active: i === this.state.splits,
        }
      );

      splitToggles.push(
        <div className={splitClass} key={`split-toggle-${i}`} onClick={this._toggleSplit.bind(this, i)}>
          <i className={`zmdi zmdi-filter_${i}`} />
        </div>
      );
    }

    return splitToggles;
  }

  _toggleSplit(status) {
    this.setState({
      splits: status,
    });
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
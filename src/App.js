'use strict';

import React, { Component } from 'react';
import logo from './logo.svg';
import './styles/App.css';

import CloudAPI from './utils/api.js'
import Player from './Player.js';
import Camera from './Camera.js';
import moment from 'moment';
import Cookie from 'js-cookie';
import classNames from 'classnames';
import Ghost from './Ghost.js';

export default class extends Component {

  constructor(props) {
    super(props);

    this.state = {
      event: {
        title: '.',
        subtitle: '.',
        startTime: '',
        endTime: '',
        details: {
          description: '.',
        },
        fakeCameras: [],
        shares: [],
        cameras: [],
      },
      playingIndex: 0,
      dataReady: false,
      playingUrl: '',
    };
  }

  componentDidMount() {
    const { search } = this.props.location;
    const token = search.split('token=')[1];

    CloudAPI.parseToken(token).then(res => {

      if (res.err) {
        this.setState({
          err: true,
        });

        return
      }

      if (res.cookies) {
        res.cookies.forEach(cookie => {
          Cookie.set(cookie.name, cookie.value, {domain: '.solinkcloud.com'});
        });
      }

      let url = '';
      let playingIndex = 0;
      res.event.cameras.forEach((camera, idx) => {
        url = CloudAPI.getPlaylist(camera) || '';

        if (url.length > 0) {
          playingIndex = idx;
        }
      });

      this.setState({
        playingUrl: url || '',
        playingIndex: playingIndex,
        info: res.info,
        event: res.event,
        dataReady: true,
      });
    })
  }

  render() {
    

    const appClass = classNames(
      'App',
      {
        'fake': !this.state.dataReady,
        'data-ready': this.state.dataReady,
      }
    );

    const infoContainerClass = classNames(
      'info-container',
      {
        show: this.state.showCamList,
      }
    );

    const appIntroClass = classNames(
      'App-intro',
      {
        show: this.state.showCamList,
      }
    );

    const upDownArrowClass = classNames(
      'zmdi',
      {
        'zmdi-keyboard_arrow_up': this.state.showCamList,
        'zmdi-keyboard_arrow_down': !this.state.showCamList,
      }
    );

    const appBodayClass = classNames(
      'app-body',
      {
        single: this.state.event.cameras.length === 1,
      }
    );

    const cameraPanelClass = classNames(
      'cameras-panel',
      {
        single: this.state.event.cameras.length === 1,
      }
    );

    const start = `${moment(this.state.event.startTime).format('hh:mm:ss')}`;
    const end = `${moment(this.state.event.endTime).format('hh:mm:ss')}`;

    const locationName = this.state.event.subtitle.split(' @ ')[1];
    return (
      <div className={appClass}>
        
        {
          false && this._renderGhost()
        }
        <div className='container'>
          <div className='App-header'>
            <div className='inner-wrap'>
              <img src={process.env.PUBLIC_URL + '/solink.png'} />
            </div>
          </div>
          <div className={appBodayClass}>
            {
              this.state.err &&
              <div className='error-mask'>
                <span className='text'>The requested resouce is unavailable</span>
              </div>
            }
            {
              this.state.dataReady &&
              <Player url={this.state.playingUrl}  />
            }
            {
              !this.state.dataReady &&
              <div className='player-fake'>
                <img src={process.env.PUBLIC_URL + '/svg/loading-spokes.svg'} />
              </div>
            }
          </div>

          <div className={infoContainerClass}>
            <div className={appIntroClass}>
              {
                this.state.event.cameras.length > 0 && this.state.dataReady &&
                <div className={cameraPanelClass}>
                  {
                    this.state.event.cameras.map((camera, idx) => {
                      return (
                        <Camera key={camera.id} camera={camera} active={idx === this.state.playingIndex && this.state.playingUrl.length > 0} inProgress={this.state.playingUrl.length === 0} index={idx} onCameraChange={this._handleCameraChange.bind(this)}/>
                      )
                    })
                  }
                </div>
              }
              {
                !this.state.dataReady &&
                <div className='cameras-panel'>
                  <Camera camera={{}}/>
                  <Camera camera={{}}/>
                </div>
              }
              {
                this.state.event.cameras.length > 1 &&
                <div className='handle' onClick={this._toggleShowCamList.bind(this)}>
                  <i className={upDownArrowClass} />
                </div>
              }
            </div>
            <div className='App-details'>
              <div className='left'>
                <div className='title'>{this.state.event.title}</div>
              </div>
              {
                this.state.dataReady &&
                <div className='right'>
                  <div className='entry'>
                    <i className='zmdi zmdi-schedule'/> 
                    <div>{start} - {end}</div>
                  </div>
                  <div className='entry'>
                    <i className='zmdi zmdi-zmdi-pin' />
                    <div>{locationName}</div>
                  </div>
                </div>
              }
              {
                !this.state.dataReady &&
                <div className='right'>
                  <div className='right-fake'/>
                </div>
              }
              <div className='description'>
                {this.state.event.details.description}
              </div>
            </div>
            {
              false &&
              <div className='App-share-info'>
                {
                  this.state.dataReady && 
                  this._renderShareInfo()
                }
              </div>
            }
          </div>
        </div>
      </div>
    );
  }

  _renderGhost() {
    return (
      <div id='ghost'><Ghost /></div>
    )
  }

  _renderShareInfo() {
    const shareInfo = this.state.event.shares.filter(share => {
      return share.email === this.state.info.sharedTo;
    });

    if (shareInfo.length === 0) {
      return;
    }

    let prefix = 'Shared By ';

    return (
      <div className='share-info'>
        <div className='share-header'>
          <div>{prefix}<span className='email'>{shareInfo[0].sharedBy}</span></div>
          <div>{moment(new Date(shareInfo[0].sharedAt)).format('h:mm:ss a')}</div>
        </div>
        {
          shareInfo[0].message && shareInfo[0].message.length > 0 &&
          <div className='share-message'>
            " {shareInfo[0].message} "
          </div>
        }
      </div>
    )
  }

  _toggleShowCamList() {
    this.setState({
      showCamList: !this.state.showCamList,
    });
  }

  _handleCameraChange(index) {
    const url = CloudAPI.getPlaylist(this.state.event.cameras[index]);

    this.setState({
      playingIndex: index,
      playingUrl: url || '',
    });
  }
}



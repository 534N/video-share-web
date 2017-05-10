'use strict';

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CloudAPI from './utils/api.js'
import Player from './Player.js';
import Camera from './Camera.js';
import moment from 'moment';
import Cookie from 'js-cookie';
import classNames from 'classnames';

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
    };
  }

  componentDidMount() {
    const { search } = this.props.location;
    const token = search.split('token=')[1];

    CloudAPI.parseToken(token).then(res => {
      if (res.cookies) {
        res.cookies.forEach(cookie => {
          Cookie.set(cookie.name, cookie.value, {domain: '.solinkcloud.com'});
        });
      }

      console.debug('event >>', res.event)

      const url = CloudAPI.getPlaylist(res.event.cameras[this.state.playingIndex]);

      this.setState({
        playingUrl: url,
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

    const start = `${moment(this.state.event.startTime).format('L')} ${moment(this.state.event.startTime).format('LTS')}`;
    const end = `${moment(this.state.event.endStart).format('L')} ${moment(this.state.event.endTime).format('LTS')}`;

    return (
      <div className={appClass}>
        <div className='container'>
          <div className='App-header'>
            <img src={process.env.PUBLIC_URL + '/solink.png'} />
            {
              this.state.dataReady &&
              <div className='right'>
                Video time: {start} - {end}
              </div>
            }
            {
              !this.state.dataReady &&
              <div className='right'>
                <div className='right-fake'/>
              </div>
            }
            
          </div>
          <div className='app-body'>
            {
              this.state.dataReady &&
              <Player url={this.state.playingUrl}  />
            }
            {
              !this.state.dataReady &&
              <div className='player-fake'/>
            }
          </div>
          <div className='App-intro'>
            {
              this.state.event.cameras.length > 0 && this.state.dataReady &&
              <div className='cameras-panel'>
                {
                  this.state.event.cameras.map((camera, idx) => {
                    console.debug('camera', camera)
                    return (
                      <Camera key={camera.id} camera={camera} active={idx === this.state.playingIndex} index={idx} onCameraChange={this._handleCameraChange.bind(this)}/>
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
          </div>
          <div className='App-details'>
            <div className='left'>
              <div className='title'>{this.state.event.title}</div>
              <div className='sub-title'>{this.state.event.subtitle}</div>

            </div>
            <div className='description'>
              {this.state.event.details.description}
            </div>
          </div>
          <div className='App-share-info'>
            {
              this.state.dataReady &&
              this._renderShareInfo()
            }
          </div>
        </div>
      </div>
    );
  }

  _renderShareInfo() {

    const shareInfo = this.state.event.shares.filter(share => {
      return share.email === this.state.info.sharedTo;
    });

    const prefix = shareInfo[0].message.length > 0 ? 'Message from ' : 'Shared By ';

    return (
      <div className='share-info'>
        <div className='share-header'>{prefix}<span className='email'>{shareInfo[0].sharedBy}</span> </div>
        {
          shareInfo[0].message.length > 0 &&
          <div className='share-message'>
            {shareInfo[0].message}
          </div>
        }
        <div className='share-footer'>{moment(new Date(shareInfo[0].sharedAt)).format('MMMM Do YYYY, h:mm:ss a')}</div>
      </div>
    )
  }


  _handleCameraChange(index) {
    const url = CloudAPI.getPlaylist(this.state.event.cameras[index]);

    this.setState({
      playingIndex: index,
      playingUrl: url,
    });
  }
}


